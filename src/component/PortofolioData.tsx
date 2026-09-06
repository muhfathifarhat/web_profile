export interface ProjectItem {
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  link?: string | null;
  tags?: string[];
  repo?: string;
}

export interface CertificateItem {
  title: string;
  issuer: string;
  date: string;
  link?: string | null;
  pdf: string; // path ke file PDF, dirender langsung jadi gambar di web
}

export const projects: ProjectItem[] = [
  {
    title: "Tracking Gps",
    subtitle: "Web Dev & Internet of Things",
    description:
      "Rancang Bangun Sistem Pelacakan Lokasi Real-Time Berbasis IoT Menggunakan Arduino dan Modul GPS untuk Kendaraan.",
    link: "https://gps-track.gt.tc", // contoh: ganti dengan URL project asli kamu
    tags: ["C++", "PHP", "JavaScript", "mySQL", "Firebase", "TinyGPS"],
    image: "/assets/project/tracking-gps.png",
    repo: "https://github.com/muhfathifarhat/GPS_Tracker",
  },
  {
    title: "Web Portofolio",
    subtitle: "Web Dev",
    description:
      "Website portofolio yang menampilkan profil, pengalaman, dan proyek yang pernah dikerjakan.",
    link: "", // contoh: ganti dengan URL project asli kamu
    tags: ["React", "TypeScript", "Tailwind"],
    image: "/assets/project/web-porto.png",
    repo: "https://github.com/muhfathifarhat/web_profile",
  },
  {
    title: "BigQuery-Ecommerce",
    subtitle: "Data Analyst",
    description:
      "Dasboard interaktif ini menampilkan performa e-commerce melalui analisis pendapatan bulanan, jumlah pelanggan, dan kinerja pengiriman.",
    link: "https://public.tableau.com/shared/W9F7T3JTG?:display_count=n&:origin=viz_share_link",
    tags: ["SQL", "Excel", "Tableau"],
    image: "/assets/project/bigquery-ecommerce.png",
    repo: "https://github.com/muhfathifarhat/BigQuery-ecommerce",
  },
  {
    title: "Keggle-Covid19 ID",
    subtitle: "Data Analyst",
    description:
      "Menganalisis perkembangan COVID-19 di Indonesia melalui visualisasi total kasus, kematian, pemulihan, distribusi kasus antarprovinsi, persebaran geografis, serta tren kasus.",
    link: "https://public.tableau.com/shared/8BFN3JNP8?:display_count=n&:origin=viz_share_link",
    tags: ["Excel", "Tableau"],
    image: "/assets/project/kaggle-covid19.png",
    repo: "https://github.com/muhfathifarhat/Kaggle-CovidID",
  },
  {
    title: "Keggle-Flight Delay",
    subtitle: "Data Analyst",
    description:
      "Menganalisis faktor penyebab keterlambatan penerbangan berdasarkan jenis delay, tren keterlambatan dari waktu ke waktu, distribusi delay antar maskapai, serta persebaran geografis.",
    link: "https://public.tableau.com/shared/9CHP4JYTX?:display_count=n&:origin=viz_share_link",
    tags: ["Excel", "Tableau"],
    image: "/assets/project/kaggle-flight.png",
    repo: "https://github.com/muhfathifarhat/Kaggle-Flight",
  },
  {
    title: "Keggle-Pokemon Stats",
    subtitle: "Data Analyst",
    description:
      "Menganalisis profil dan statistik setiap Pokémon secara interaktif, mencakup informasi tipe, generasi, status Legendary, distribusi atribut, power berdasarkan Pokémon yang dipilih.",
    link: "https://public.tableau.com/shared/4CGKWMYGJ?:display_count=n&:origin=viz_share_link",
    tags: ["Excel", "Tableau"],
    image: "/assets/project/kaggle-pokestat.png",
    repo: "https://github.com/muhfathifarhat/Kaggle-Pokemon",
  },
  {
    title: "Cleansing Data Pasien Rumah Sakit",
    subtitle: "Data Analyst",
    description:
      "Merancang pipeline SQL untuk membersihkan data rekam pasien rumah sakit dengan 19 kolom mencakup standarisasi format data, normalisasi teks, validasi logis data, hingga identifikasi duplikasi.",
    link: "",
    tags: ["SQL", "Bigquery"],
    image: "/assets/project/Clean-Rumah-Sakit.png",
    repo: "https://github.com/muhfathifarhat/Data_Cleansing_Pasien_Rumah_Sakit",
  },
  {
    title: "Cleansing Data Jadwal Kereta",
    subtitle: "Data Analyst",
    description:
      "Merancang pipeline SQL untuk membersihkan data Jadwal keberangkatan kerata api dengan 11 kolom mencakup standarisasi format data, normalisasi teks, validasi logis data, hingga identifikasi duplikasi.",
    link: "",
    tags: ["SQL", "Bigquery"],
    image: "/assets/project/Clean-Jadwal-Kereta.png",
    repo: "https://github.com/muhfathifarhat/Data_Cleansing_Jadwal_Kereta",
  },
  {
    title: "",
    description: "",
    link: null,
    tags: [],
  },
];

export const certificates: CertificateItem[] = [
  {
    title: "BNSP Pemrograman",
    issuer: "BNSP",
    date: "2025",
    link: null,
    pdf: "/assets/certificate/BNSP-Pemrograman.pdf",
  },
  {
    title: "Pivot Table In Microsoft Excel",
    issuer: "MySkill",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/Pivot-Table.pdf",
  },
  {
    title: "Preparation Class SQL",
    issuer: "DQLab",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/Preparation_Class_SQL_DQLab.pdf",
  },
  {
    title: "Fundamental Class SQL",
    issuer: "DQLab",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/Fundamental_Class_SQL_DQLab.pdf",
  },
  {
    title: "Industry Application Class SQL",
    issuer: "DQLab",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/Industry_Application_Class_SQL_DQLab.pdf",
  },
  {
    title: "Preparaion Class Python",
    issuer: "DQLab",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/Preparation_Class_Python_DQLab.pdf",
  },
  {
    title: "Fundamental Class Python",
    issuer: "DQLab",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/Fundamental_Class_Python_DQLab.pdf",
  },
  {
    title: "Intro To Data Analytics",
    issuer: "Revou",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/Intro-To-Data-Analytic.pdf",
  },
  {
    title: "Data Analyst & Business Intelligence",
    issuer: "Dibimbing",
    date: "2026",
    link: null,
    pdf: "/assets/certificate/DataAnalytic&BusinessIntelligence.pdf",
  },
];

// Jumlah project "asli" yang dihitung untuk statistik -- kartu placeholder
// "Coming Soon" (title kosong) sengaja tidak ikut dihitung.
export const projectCount = projects.filter(
  (p) => p.title.trim() !== "",
).length;
export const certificateCount = certificates.length;
