"use client";
interface FilterProps {
  filters: Record<string, string>;
  setFilters: (f: Record<string, string>) => void;
}

export default function FilterPanel({ filters, setFilters }: FilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters({ ...filters, [name]: checked ? "yes" : "" });
  };

  return (
    <div className="p-4 flex gap-4 bg-white shadow rounded mb-4">
      <label>
        <input type="checkbox" name="slide" onChange={handleChange} /> Escorrega
      </label>
      <label>
        <input type="checkbox" name="bench" onChange={handleChange} /> Bancos
      </label>
      <label>
        <input type="checkbox" name="shade" onChange={handleChange} /> Sombra
      </label>
    </div>
  );
}
