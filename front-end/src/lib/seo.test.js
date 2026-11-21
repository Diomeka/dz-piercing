import { describe, expect, it } from "vitest";
import { ficheCommerce } from "./seo.js";

describe("Fiche Google (schema.org)", () => {
  const f = ficheCommerce();
  it("décrit un commerce avec nom, téléphone et adresse", () => {
    expect(f["@type"]).toBe("HealthAndBeautyBusiness");
    expect(f.name).toBe("DZ PIERCING");
    expect(f.telephone).toBeTruthy();
    expect(f.address.streetAddress).toBeTruthy();
  });
  it("ne liste que les jours ouverts", () => {
    const jours = f.openingHoursSpecification.map((h) => h.dayOfWeek);
    expect(jours).toEqual(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    expect(f.openingHoursSpecification[0]).toMatchObject({ opens: "10:00", closes: "19:00" });
  });
});
