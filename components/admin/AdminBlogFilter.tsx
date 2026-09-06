"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { BlogStatus } from "@/app/generated/prisma/enums";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminBlogFilterProps = {
  query: string;
  status: string | undefined;
  brandId: string | undefined;
  brands: { id: string; name: string }[];
  ALL: string;
};

export default function AdminBlogFilter({
  query,
  status,
  brandId,
  brands,
  ALL,
}: AdminBlogFilterProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    const searchParams = new URLSearchParams();
    
    const q = formData.get("query")?.toString().trim();
    if (q) searchParams.set("query", q);
    
    const s = formData.get("status")?.toString();
    if (s && s !== ALL) searchParams.set("status", s);
    
    const b = formData.get("brand")?.toString();
    if (b && b !== ALL) searchParams.set("brand", b);
    
    router.push(`/af-ass-manage/blog?${searchParams.toString()}`);
  };

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_200px]"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          name="query"
          defaultValue={query}
          placeholder="Search title or slug…"
          className="h-10 bg-white pl-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onBlur={() => handleSubmit()}
        />
      </div>
      <Select 
        name="status" 
        defaultValue={status ?? ALL}
        onValueChange={(val) => {
          // Instead of relying on the hidden input, we update the search parameter directly
          const formData = new FormData(formRef.current!);
          const searchParams = new URLSearchParams();
          
          const q = formData.get("query")?.toString().trim();
          if (q) searchParams.set("query", q);
          
          if (val && val !== ALL) searchParams.set("status", val);
          
          const b = formData.get("brand")?.toString();
          if (b && b !== ALL) searchParams.set("brand", b);
          
          router.push(`/af-ass-manage/blog?${searchParams.toString()}`);
        }}
      >
        <SelectTrigger className="h-10 w-full bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {Object.values(BlogStatus).map((item: string) => (
            <SelectItem key={item} value={item}>
              {item === "CONTACTED" ? "Messaged" : item.toLocaleLowerCase().replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select 
        name="brand" 
        defaultValue={brandId ?? ALL}
        onValueChange={(val) => {
          const formData = new FormData(formRef.current!);
          const searchParams = new URLSearchParams();
          
          const q = formData.get("query")?.toString().trim();
          if (q) searchParams.set("query", q);
          
          const s = formData.get("status")?.toString();
          if (s && s !== ALL) searchParams.set("status", s);
          
          if (val && val !== ALL) searchParams.set("brand", val);
          
          router.push(`/af-ass-manage/blog?${searchParams.toString()}`);
        }}
      >
        <SelectTrigger className="h-10 w-full bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All brands</SelectItem>
          {brands.map((brand: { id: string; name: string }) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
