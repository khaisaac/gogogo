export interface TrekkingPackage {
  slug: string;
  title: string;
  duration: string;
  price: number;
  image: string;
  location: "Sembalun" | "Senaru";
  difficulty: number;
  description: string;
  highlights: string[];
}

export const sembalunPackages: TrekkingPackage[] = [
  {
    slug: "rinjani-2d1n-summit-sembalun",
    title: "Mount Rinjani 2 Days and 1 Night Summit Sembalun Route",
    duration: "2 Days",
    price: 190,
    image: "/sembalun.jpg",
    location: "Sembalun",
    difficulty: 4,
    description:
      "Paket pendakian cepat untuk mengejar puncak Rinjani via Sembalun. Cocok untuk pendaki yang fit dan ingin pengalaman summit intens dengan waktu terbatas.",
    highlights: [
      "Start dari Sembalun dengan jalur savana ikonik",
      "Camp strategis untuk summit attack dini hari",
      "Sunrise dari puncak Rinjani 3,726 mdpl",
    ],
  },
  {
    slug: "sharing-group-budget-3d-sembalun",
    title: "2 Days To 3 Days Sharing Group on Budget",
    duration: "3 Days",
    price: 115,
    image: "/hero-banner.png",
    location: "Sembalun",
    difficulty: 3,
    description:
      "Paket sharing hemat dengan itinerary fleksibel 2D1N hingga 3D2N. Pilihan terbaik untuk backpacker yang ingin menekan biaya tanpa kehilangan pengalaman utama Rinjani.",
    highlights: [
      "Biaya lebih hemat dengan sistem sharing group",
      "Pendampingan guide lokal berpengalaman",
      "Rute disesuaikan dengan kondisi grup dan cuaca",
    ],
  },
  {
    slug: "rinjani-4d-sembalun-torean",
    title: "Mount Rinjani Trekking Summit 4 Days Sembalun to Torean",
    duration: "4 Days",
    price: 275,
    image: "/hero-banner.png",
    location: "Sembalun",
    difficulty: 5,
    description:
      "Program eksplorasi penuh 4 hari dengan kombinasi jalur Sembalun dan turun via Torean. Ideal untuk pendaki yang ingin menikmati semua sisi terbaik Rinjani dengan pace santai.",
    highlights: [
      "Summit, crater rim, danau, dan hot spring",
      "Descent via Torean dengan panorama lembah hijau",
      "Durasi lebih panjang untuk adaptasi dan recovery",
    ],
  },
  {
    slug: "rinjani-3d-sembalun-torean",
    title: "Mount Rinjani Trekking Summit 3 Days Sembalun to Torean",
    duration: "3 Days",
    price: 230,
    image: "/hero-banner.png",
    location: "Sembalun",
    difficulty: 4,
    description:
      "Paket favorit untuk mengejar summit sekaligus menikmati jalur turun Torean. Komposisi durasi dan rute seimbang untuk pendaki berpengalaman menengah.",
    highlights: [
      "Summit attack dengan timing optimal",
      "Turun melalui jalur Torean yang scenic",
      "Camping spot terbaik di crater rim",
    ],
  },
];

export const senaruPackages: TrekkingPackage[] = [
  {
    slug: "rinjani-3d2n-lake-hot-spring-senaru",
    title: "Mount Rinjani Trekking 3 Days and 2 Nights Lake and Hot Spring",
    duration: "3 Days",
    price: 230,
    image: "/senaru.jpg",
    location: "Senaru",
    difficulty: 3,
    description:
      "Rute hijau Senaru dengan fokus pengalaman Danau Segara Anak dan pemandian air panas alami. Cocok untuk pendaki yang ingin kombinasi tantangan dan relaksasi.",
    highlights: [
      "Jalur hutan tropis Senaru yang rindang",
      "Berendam di natural hot spring",
      "Malam di area danau Segara Anak",
    ],
  },
  {
    slug: "rinjani-4d-senaru-sembalun",
    title: "Mount Rinjani Trekking Summit 4 Days Senaru to Sembalun",
    duration: "4 Days",
    price: 275,
    image: "/hero-banner.png",
    location: "Senaru",
    difficulty: 4,
    description:
      "Pendakian lintas jalur dari Senaru ke Sembalun selama 4 hari. Rute ini memberi pengalaman landscape paling lengkap dari hutan sampai savana.",
    highlights: [
      "Cross-route dari sisi barat ke timur Rinjani",
      "Ritme pendakian lebih santai dan aman",
      "Cakupan panorama paling variatif",
    ],
  },
  {
    slug: "rinjani-2d1n-senaru-crater-rim",
    title: "Mount Rinjani 2 Days and 1 Night to Senaru Crater Rim",
    duration: "2 Days",
    price: 169,
    image: "/hero-banner.png",
    location: "Senaru",
    difficulty: 3,
    description:
      "Paket singkat ke crater rim Senaru untuk kamu yang ingin sensasi Rinjani tanpa harus summit. Durasi ringkas dengan view dramatis ke arah danau.",
    highlights: [
      "Trek pendek cocok untuk pemula fit",
      "Sunset dan sunrise dari crater rim",
      "Pilihan ideal untuk waktu liburan terbatas",
    ],
  },
  {
    slug: "sharing-group-budget-3d-senaru",
    title: "2 Days To 3 Days Sharing Group on Budget",
    duration: "3 Days",
    price: 115,
    image: "/hero-banner.png",
    location: "Senaru",
    difficulty: 3,
    description:
      "Versi budget sharing dari sisi Senaru dengan fleksibilitas itinerary. Opsi tepat untuk solo traveler yang ingin join grup dan tetap hemat.",
    highlights: [
      "Open trip dengan keberangkatan reguler",
      "Guide dan porter lokal terpercaya",
      "Durasi dapat disesuaikan kondisi grup",
    ],
  },
];

export const allTrekkingPackages: TrekkingPackage[] = [
  ...sembalunPackages,
  ...senaruPackages,
];

export function getPackageBySlug(slug: string) {
  return allTrekkingPackages.find((pkg) => pkg.slug === slug);
}
