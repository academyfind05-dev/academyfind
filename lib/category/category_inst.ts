import { prisma } from "@/lib/prisma";
import { meili } from "@/lib/meilisearch";
import { Institute, City, Review } from "@/app/generated/prisma/client";

export type InstituteWithDistance = Institute & {
  city: City;
  distance?: string | null;
};

export async function getInstitutesByCategory(
  categorySlug: string,
  page: number = 1,
  q?: string,
  sort?: string,         
  rating?: string,       
  mode?: string,         
  lat?: number,          // 🚀 NAYA PARAMETER
  lng?: number,          // 🚀 NAYA PARAMETER
  providerType?: string,
  limit: number = 12
) {
  const skip = (page - 1) * limit;
  const modesArray = mode ? mode.split(",").map(m => m.trim().toUpperCase()) : [];
  
  const isHomeTuition = modesArray.includes("HOMETUITION");
  const pureModes = modesArray.filter(m => m !== "HOMETUITION");

  // ==========================================
  // 🚀 SCENARIO 1: MEILISEARCH (Text Search & Live GPS)
  // ==========================================
  if ((q && q.trim() !== "") || (lat && lng)) {
    let searchOptions: any = {
      matchingStrategy: 'all',
      filter: [
        `type = "institute"`,
        `isActive = true`, 
        `isPublished = true`,
        `categorySlugs = "${categorySlug}"`
      ],
      limit: limit,
      offset: skip,
    };

    if (rating && rating !== "all") {
      searchOptions.filter.push(`googleRating >= ${parseFloat(rating)}`);
    }

    if (providerType && providerType !== "ALL") {
      searchOptions.filter.push(`providerType = "${providerType}"`);
    }

    if (pureModes.length > 0 && pureModes.length < 3) {
      const meiliModes = pureModes.map(m => `"${m.toLowerCase()}"`).join(", ");
      searchOptions.filter.push(`mode IN [${meiliModes}]`);
    }

    // Proximity logic or fallback sorting logic
    if (sort === "rating") {
      searchOptions.sort = ["planWeight:desc", "googleRating:desc"];
    } else if (sort === "reviews") {
      searchOptions.sort = ["planWeight:desc", "googleReviewCount:desc"];
    } else if (lat && lng) {
      searchOptions.sort = [`_geoPoint(${lat}, ${lng}):asc`, "googleReviewCount:desc", "planWeight:desc", "googleRating:desc"]; 
    } else {
      searchOptions.sort = ["planWeight:desc", "googleRating:desc"];
    }

    let searchQuery = q ? q.trim() : "";
    if (isHomeTuition) {
      searchQuery = searchQuery ? `${searchQuery} home tuition` : "home tuition";
    }

    let searchRes = await meili.index("global_search").search(searchQuery, searchOptions);

    const instituteIds = searchRes.hits.map((hit: any) => hit.prismaId);

    if (instituteIds.length === 0) {
      return { institutes: [], totalPages: 0, currentPage: page, totalCount: 0 };
    }

    const dbInstitutes = await prisma.institute.findMany({
      where: { 
        id: { in: instituteIds },
        isActive: true ,
        isPublished: true,
      },
      include: { city: true },
    });

    const distanceMap = new Map(
      searchRes.hits.map((hit: any) => [
        hit.prismaId, 
        hit._geoDistance ? (hit._geoDistance / 1000).toFixed(1) : null
      ])
    );

    const orderedInstitutes = instituteIds.flatMap((id) => {
      const inst = dbInstitutes.find((i) => i.id === id);
      if (!inst) return [];
      return [{
        ...inst,
        distance: distanceMap.get(id) || null
      }];
    });

    return {
      institutes: orderedInstitutes,
      totalPages: Math.ceil((searchRes.estimatedTotalHits || 0) / limit),
      currentPage: page,
      totalCount: searchRes.estimatedTotalHits || 0,
    };
  }

  // ==========================================
  // 🏢 SCENARIO 2: PURE PRISMA FALLBACK (Bina GPS ke)
  // ==========================================
  const whereClause: any = {
    isActive: true,
    isPublished: true,
    categories: {
      some: {
        category: {
          slug: categorySlug,
        },
      },
    },
  };

  if (q && q.trim() !== "") {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } }, 
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (rating && rating !== "all") {
    whereClause.googleRating = { gte: parseFloat(rating) };
  }

  if (providerType && providerType !== "ALL") {
    whereClause.providerType = providerType;
  }

  if (pureModes.length > 0 && pureModes.length < 3) {
    whereClause.mode = { in: pureModes as any[] };
  }

  if (isHomeTuition) {
    whereClause.AND = [
      ...(whereClause.AND || []),
      {
        OR: [
          { categories: { some: { category: { slug: 'home-tuition' } } } },
          { name: { contains: 'home tuition', mode: 'insensitive' } },
          { name: { contains: 'hometuition', mode: 'insensitive' } },
          { name: { contains: 'tutor', mode: 'insensitive' } },
        ]
      }
    ];
  }

  let orderBy: any = [{ planWeight: 'desc' }, { googleRating: 'desc' }, { id: 'asc' }];
  if (sort === "rating") {
    orderBy = [{ planWeight: 'desc' }, { googleRating: 'desc' }, { id: 'asc' }];
  } else if (sort === "reviews") {
    orderBy = [{ planWeight: 'desc' }, { googleReviewCount: 'desc' }, { id: 'asc' }];
  }

  const [institutes, totalCount] = await prisma.$transaction([
    prisma.institute.findMany({
      where: whereClause,
      include: { city: true },
      skip: skip,
      take: limit,
      orderBy,
    }),
    prisma.institute.count({
      where: whereClause, 
    }),
  ]);

  return {
    institutes,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    totalCount,
  };
}