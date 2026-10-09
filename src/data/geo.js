import realGeo from "./india_states_real.json";
import { STATES } from "./mock";

const NAME_TO_ID = {};
for (const s of STATES) {
  NAME_TO_ID[s.name] = s.id;
}
NAME_TO_ID["Orissa"] = "OD";
NAME_TO_ID["Uttaranchal"] = "UK";
NAME_TO_ID["NCT of Delhi"] = "DL";
NAME_TO_ID["Delhi NCR"] = "DL";

export const INDIA_GEOJSON = {
  type: "FeatureCollection",
  features: realGeo.features.map((f) => ({
    ...f,
    properties: {
      ...f.properties,
      id: NAME_TO_ID[f.properties.name] || f.properties.name.slice(0, 2).toUpperCase(),
    },
  })),
};
