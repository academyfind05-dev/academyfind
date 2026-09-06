import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { BlogStatus } from "@/app/generated/prisma/enums";

type MyPostsGridProps = {
  posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    coverImageAlt: string | null;

    status: BlogStatus;

    readingTime: number | null;

    viewCount: number;
    likeCount: number;
    commentCount: number;

    updatedAt: Date;

    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }[];
};

const statusStyles: Record<BlogStatus, string> = {
  DRAFT:
    "bg-amber-100 text-amber-700 border-amber-200",

  PENDING_REVIEW:
    "bg-violet-100 text-violet-700 border-violet-200",

  CONTACTED:
    "bg-violet-100 text-violet-700 border-violet-200",

  SCHEDULED:
    "bg-blue-100 text-blue-700 border-blue-200",

  PUBLISHED:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  REJECTED:
    "bg-red-100 text-red-700 border-red-200",

  ARCHIVED:
    "bg-slate-100 text-slate-700 border-slate-200",
};

const statusLabels: Record<BlogStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  CONTACTED: "Pending Review",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

export default function MyPostsGrid({
  posts,
}: MyPostsGridProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt ?? post.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No Cover Image
              </div>
            )}

            <span
              className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold ${
                statusStyles[post.status]
              }`}
            >
              {statusLabels[post.status]}
            </span>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <h2 className="line-clamp-2 text-2xl font-bold text-slate-900">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="mt-3 line-clamp-3 text-slate-600">
                  {post.excerpt}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount}
              </span>

              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likeCount}
              </span>

              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.commentCount}
              </span>

              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {post.updatedAt.toLocaleDateString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="flex gap-3">
                <Link
                  href={`/blog/edit/${post.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>

                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </Link>
              </div>

              <button className="rounded-xl border border-slate-300 p-2 transition hover:bg-slate-100">
                <MoreHorizontal className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
