import WhiteboardLayout from "@/components/whiteboard/WhiteboardLayout";

interface BoardSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardSlugPage({ params }: BoardSlugPageProps) {
  const { slug } = await params;
  return <WhiteboardLayout slug={slug} />;
}
