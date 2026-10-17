export const donationCategories = [
  { value: "FOOD", label: "Food & groceries", icon: "🥫", description: "Packaged food, groceries and fresh produce", tone: "bg-orange-50" },
  { value: "CLOTHING", label: "Clothing & footwear", icon: "👕", description: "Clothes, shoes, coats and accessories", tone: "bg-sky-50" },
  { value: "BOOKS_EDUCATION", label: "Books & education", icon: "📚", description: "Books, stationery and learning materials", tone: "bg-violet-50" },
  { value: "HOUSEHOLD", label: "Household essentials", icon: "🧺", description: "Kitchenware, bedding and daily-use items", tone: "bg-amber-50" },
  { value: "FURNITURE", label: "Furniture", icon: "🪑", description: "Chairs, tables, shelves and usable furniture", tone: "bg-yellow-50" },
  { value: "ELECTRONICS", label: "Electronics", icon: "💻", description: "Working phones, computers and devices", tone: "bg-emerald-50" },
  { value: "APPLIANCES", label: "Home appliances", icon: "🔌", description: "Working fans, mixers and small appliances", tone: "bg-cyan-50" },
  { value: "TOYS_GAMES", label: "Toys & games", icon: "🧸", description: "Toys, puzzles, sports and play equipment", tone: "bg-rose-50" },
  { value: "MEDICAL_SUPPLIES", label: "Medical supplies", icon: "🩹", description: "Permitted, unopened and in-date supplies", tone: "bg-red-50" },
  { value: "HYGIENE_PERSONAL_CARE", label: "Hygiene & personal care", icon: "🧴", description: "Sealed hygiene and personal-care essentials", tone: "bg-pink-50" },
  { value: "BABY_SUPPLIES", label: "Baby supplies", icon: "🍼", description: "Baby clothes, diapers and care essentials", tone: "bg-indigo-50" },
  { value: "SCHOOL_SUPPLIES", label: "School supplies", icon: "✏️", description: "Bags, stationery and classroom materials", tone: "bg-lime-50" },
  { value: "MOBILITY_ACCESSIBILITY", label: "Mobility & accessibility", icon: "♿", description: "Usable mobility aids and accessibility items", tone: "bg-teal-50" },
  { value: "PET_SUPPLIES", label: "Pet supplies", icon: "🐾", description: "Pet food, carriers and useful pet items", tone: "bg-orange-50" },
  { value: "OTHER", label: "Other useful items", icon: "📦", description: "Other safe, legal and reusable items", tone: "bg-slate-100" },
];

export const categoryLabels = Object.fromEntries(donationCategories.map(({ value, label }) => [value, label]));
export const categoryIcons = Object.fromEntries(donationCategories.map(({ value, icon }) => [value, icon]));
export const getDonationTitle = (donation) => donation?.foodName || donation?.title || "Untitled donation";
