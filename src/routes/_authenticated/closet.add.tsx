import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Camera, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  addItem,
  CATEGORY_LABELS,
  COLOR_PRESETS,
  STUDIO_PALETTES,
  fileToDataUrl,
  type Category,
  type Formality,
  type Season,
} from "@/lib/closet-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/closet/add")({
  head: () => ({
    meta: [{ title: "Add a piece — Rewear Radar" }],
  }),
  component: AddPiece,
});

const SEASONS: Season[] = ["spring", "summer", "fall", "winter"];
const FORMALITIES: Formality[] = ["casual", "smart", "formal"];

function AddPiece() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("tops");
  const [colorName, setColorName] = useState("Cream");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [fabric, setFabric] = useState("");
  const [seasons, setSeasons] = useState<Season[]>(["fall"]);
  const [formality, setFormality] = useState<Formality>("smart");
  const [busy, setBusy] = useState(false);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      setPhoto(await fileToDataUrl(file));
    } catch {
      toast.error("Couldn't read that photo — try another one.");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!name.trim()) {
      toast.error("Give the piece a name so you can spot it later.");
      return;
    }
    const color = COLOR_PRESETS.find((c) => c.name === colorName)!;
    const item = addItem({
      name: name.trim(),
      category,
      colorName: color.name,
      colorHex: color.hex,
      size: size.trim() || "—",
      brand: brand.trim() || undefined,
      fabric: fabric.trim() || undefined,
      seasons: seasons.length ? seasons : (["spring", "summer", "fall", "winter"] as Season[]),
      formality,
      imageUrl: photo,
    });
    toast.success("Added to your closet.");
    navigate({ to: "/closet/$id", params: { id: item.id } });
  };

  return (
    <div className="w-full space-y-6">
      <button
        onClick={() => navigate({ to: "/closet" })}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to closet
      </button>

      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Add a piece
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A photo helps, but chromatic and formal details power your Rewear Radar match-ups.
        </p>
      </div>

      {/* Photo */}
      <div className="grain-card rounded-2xl p-5">
        {photo ? (
          <div className="relative w-40 overflow-hidden rounded-xl">
            <img src={photo} alt="Piece preview" className="aspect-square w-full object-cover" />
            <button
              onClick={() => setPhoto(undefined)}
              aria-label="Remove photo"
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-card/90 shadow"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-input bg-secondary/50 py-8 text-sm text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Camera className="size-6 text-primary" strokeWidth={1.5} />
            {busy ? "Processing photo…" : "Add a photo (optional)"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>

      {/* Details */}
      <div className="grain-card space-y-5 rounded-2xl p-5 sm:p-6">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Midnight spruce utility jacket"
            className={inputCls}
          />
        </Field>

        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={pillCls(category === c)}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Color Selection">
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColorName(c.name)}
                aria-label={c.name}
                aria-pressed={colorName === c.name}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-3 text-xs font-medium transition-all",
                  colorName === c.name
                    ? "bg-primary text-primary-foreground border-transparent shadow-xs font-semibold"
                    : "border-input bg-card text-foreground hover:bg-secondary hover:border-primary/40",
                )}
              >
                <span
                  className="size-4.5 rounded-full border border-black/15 shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Size">
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="M"
              className={inputCls}
            />
          </Field>
          <Field label="Brand (optional)">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Arket"
              className={inputCls}
            />
          </Field>
          <Field label="Fabric (optional)">
            <input
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="Linen"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Seasons">
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => {
              const on = seasons.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeasons(on ? seasons.filter((x) => x !== s) : [...seasons, s])}
                  className={pillCls(on)}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="How dressy is it?">
          <div className="flex flex-wrap gap-2">
            {FORMALITIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormality(f)}
                className={pillCls(formality === f)}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <button
        onClick={save}
        disabled={busy}
        className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        Add to my closet
      </button>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const pillCls = (on: boolean) =>
  cn(
    "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
    on
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
  );

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
