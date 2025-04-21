exports.seed = async function (knex) {
  await knex("ingredients").del();

  await knex("ingredients").insert([
    {
      id: 1,
      name: "Kecap Manis",
      unit: "sdm",
      image_url: "https://example.com/kecap.jpg",
    },
    {
      id: 2,
      name: "Telur",
      unit: "butir",
      image_url: "https://example.com/telur.jpg",
    },
    {
      id: 3,
      name: "Nasi Putih",
      unit: "piring",
      image_url: "https://example.com/nasi.jpg",
    },
    {
      id: 4,
      name: "Bawang Merah",
      unit: "siung",
      image_url: "https://example.com/bawang_merah.jpg",
    },
    {
      id: 5,
      name: "Minyak Goreng",
      unit: "sdm",
      image_url: "https://example.com/minyak.jpg",
    },
    {
      id: 6,
      name: "Mie Instan",
      unit: "bungkus",
      image_url: "https://example.com/mie.jpg",
    },
    {
      id: 7,
      name: "Cabe Merah",
      unit: "buah",
      image_url: "https://example.com/cabe.jpg",
    },
    {
      id: 8,
      name: "Sosis",
      unit: "buah",
      image_url: "https://example.com/sosis.jpg",
    },
  ]);
};
