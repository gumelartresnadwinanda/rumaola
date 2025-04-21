exports.seed = async function (knex) {
  await knex("recipes").del();

  await knex("recipes").insert([
    {
      id: 1,
      name: "Nasi Goreng Sederhana",
      default_portion: 1,
      image_url: "https://example.com/nasi_goreng.jpg",
    },
    {
      id: 2,
      name: "Mie Goreng Sosis",
      default_portion: 1,
      image_url: "https://example.com/mie_goreng.jpg",
    },
  ]);
};
