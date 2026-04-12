import { MenuCreationOptions } from "@/components/owner/MenuCreationOptions";

export default function CreateMenuHubPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <h1 className="font-headline text-3xl tracking-tight text-primary md:text-4xl">
          Create menu
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Start from a blank menu, import a spreadsheet, or extract from a photo.
        </p>
      </div>

      <MenuCreationOptions layout="horizontal" showInnerHeading={false} />
    </div>
  );
}
