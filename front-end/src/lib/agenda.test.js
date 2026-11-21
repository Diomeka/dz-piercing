import { describe, expect, it } from "vitest";
import { rendezVousIcs } from "./agenda.js";

const RDV = { id: "r1", reference: "DZ-AB12C", prestationType: "piercing", prestationNom: "Hélix", date: "2027-01-05", heure: "14:30" };

describe("Fichier agenda (.ics)", () => {
  const ics = rendezVousIcs(RDV, 20);

  it("respecte le format iCalendar (lignes CRLF, VEVENT)", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("\r\nBEGIN:VEVENT\r\n");
    expect(ics.trim().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("place le RDV à l'heure choisie, avec la durée du piercing", () => {
    expect(ics).toContain("DTSTART:20270105T143000");
    expect(ics).toContain("DTEND:20270105T145000");
  });

  it("contient le piercing, l'adresse, la référence et un rappel 2 h avant", () => {
    expect(ics).toContain("SUMMARY:Piercing Hélix — DZ PIERCING");
    expect(ics).toMatch(/LOCATION:.+/);
    expect(ics).toContain("DZ-AB12C");
    expect(ics).toContain("TRIGGER:-PT2H");
  });

  it("échappe les virgules de l'adresse", () => {
    expect(ics).toMatch(/LOCATION:[^\r]*\\,/);
  });
});
