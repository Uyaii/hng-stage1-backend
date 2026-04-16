import express from "express";
import cors from "cors";
import { uuidv7 } from "uuidv7";
import axios from "axios";
import supabase from "./connectDB.js";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      console.log("DB connection failed:", error.message);
    } else {
      console.log("DB connected successfully");
    }
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

const genderizeApi = async (name) => {
  try {
    const response = await axios.get(`https://api.genderize.io?name=${name}`);
    const data = response.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

const agifyApi = async (name) => {
  try {
    const response = await axios.get(`https://api.agify.io?name=${name}`);
    const data = response.data;

    return data;
  } catch (error) {
    console.log(error);
  }
};
const nationalizeApi = async (name) => {
  try {
    const response = await axios.get(`https://api.nationalize.io?name=${name}`);
    const data = response.data;

    return data;
  } catch (error) {
    console.log(error);
  }
};

const duplicateCheck = async (name) => {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("name", name);

  return { data, error };
};

app.post("/api/profiles", async (req, res) => {
  const { name } = req.body;
  // Missing or Empty Name Error Handling
  if (!name || name.trim() === "") {
    return res.status(400).send({
      status: "error",
      message: "Missing Name or Empty Name",
    });
  }
  // Numeric Name Error Handling
  if (typeof name !== "string") {
    return res.status(422).send({
      status: "error",
      message: "Numeric Name instead of String",
    });
  }

  const nameInsensitive = name.toLowerCase();
  const { data, error } = await duplicateCheck(nameInsensitive);
  if (data.length >= 1) {
    return res.status(201).send({
      status: "success",
      message: "Profile already exists",
      data: data[0],
    });
  }

  let externalApi = "";
  try {
    //   * GENDERIZE
    externalApi = "Genderize";
    const genderDetails = await genderizeApi(name);
    const { gender, probability, count } = genderDetails;
    const sample_size = count;
    if (gender === null || count === 0) {
      return res.status(400).send({
        status: "error",
        message: `${externalApi} returned an invalid response`,
      });
    }

    // * AGIFY
    externalApi = "Agify";
    const ageDetails = await agifyApi(name);
    const { age } = ageDetails;
    if (age === null) {
      return res.status(502).send({
        status: "error",
        message: `${externalApi} returned an invalid response`,
      });
    }
    let age_group = "";
    if (age <= 12) {
      age_group = "child";
    } else if (age >= 13 && age <= 19) {
      age_group = "teenager";
    } else if (age >= 20 && age <= 59) {
      age_group = "adult";
    } else {
      age_group = "senior";
    }

    // * NATIONALIZE
    externalApi = "Nationalize";
    const countryDetails = await nationalizeApi(name);

    if (!countryDetails.country || countryDetails.country.length === 0) {
      return res.status(502).send({
        status: "error",
        message: `${externalApi} returned an invalid response`,
      });
    }
    const firstCountry = countryDetails.country[0];

    const extractedData = {
      id: uuidv7(),
      name: nameInsensitive,
      gender,
      gender_probability: probability,
      sample_size,
      age,
      age_group,
      country_id: firstCountry.country_id,
      country_probability: firstCountry.probability,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("profiles")
      .insert(extractedData);
    if (error) {
      return res.status(400).json(error);
    }

    res.status(201).send({ status: "success", data: extractedData });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/profiles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", id);
    if (data.length === 0) {
      return res
        .status(404)
        .send({ status: "error", message: "Profile not found" });
    } else if (data.length >= 1) {
      return res.status(200).send({ status: "success", data: data[0] });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/profiles", async (req, res) => {
  const { gender, country_id, age_group } = req.query;
  let query = supabase.from("profiles").select("*");

  if (gender) {
    query = query.eq("gender", gender.toLowerCase());
  }
  if (country_id) {
    query = query.eq("country_id", country_id.toUpperCase());
  }
  if (age_group) {
    query = query.eq("age_group", age_group.toLowerCase());
  }

  try {
    const { data, error } = await query;
    if (data.length >= 1 || data.length === 0) {
      return res.status(200).send({
        status: "success",
        count: data.length,
        data,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.delete("/api/profiles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await supabase.from("profiles").delete().eq("id", id);
    if (response >= 1) {
      return res.status(204);
    } else {
      return res.send(response);
    }
  } catch (error) {
    console.log(error);
  }
});
