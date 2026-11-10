/* AIR HVAC indicative cooling-size calculator. No customer data is uploaded. */
(function () {
  "use strict";
  function estimateCooling({ length, width, height, room, insulation, sun, glazing, people }) {
  const roomFactors = { bedroom: 1, lounge: 1, office: 1.08, kitchen: 1.2, loft: 1.2, conservatory: 1.6 };
  const insulationFactors = { good: 0.9, average: 1, poor: 1.15 };
  const sunFactors = { shaded: 0.9, typical: 1, sunny: 1.15 };
  const glazingFactors = { small: 0.95, average: 1, large: 1.15 };
  if (![length, width, height, people].every(Number.isFinite) || length < 1 || width < 1 || height < 2 || people < 1 || people > 20 || !Number.isInteger(people)) throw new RangeError("Please enter valid room measurements and occupant count.");
  if (!(room in roomFactors) || !(insulation in insulationFactors) || !(sun in sunFactors) || !(glazing in glazingFactors)) throw new RangeError("Please choose valid room characteristics.");
  const area = length * width;
  const baseKw = area * 0.1 * (height / 2.4);
  const coolingKw = baseKw * roomFactors[room] * insulationFactors[insulation] * sunFactors[sun] * glazingFactors[glazing] + Math.max(0, people - 2) * 0.12;
  const nominalSizes = [2, 2.5, 3.5, 4.2, 5, 6, 7.1];
  const suggestedKw = nominalSizes.find(size => size + 1e-8 >= coolingKw) ?? null;
  const needsSurvey = room === "conservatory" || area > 50 || height > 3.3 || suggestedKw === null;
  const solarCaution = sun === "sunny" && glazing === "large";
  return { area, volume: area * height, coolingKw, btuPerHour: coolingKw * 3412.142, suggestedKw, needsSurvey, solarCaution };
}

  // Export calculation logic for Node's built-in test runner.
  if (typeof module !== "undefined" && module.exports) module.exports = { estimateCooling };
  if (typeof document === "undefined") return;

  const form = document.getElementById("cooling-calculator-form");
  if (!form) return;
  const size = document.getElementById("calc-size");
  const load = document.getElementById("calc-load");
  const btu = document.getElementById("calc-btu");
  const area = document.getElementById("calc-area");
  const note = document.getElementById("calc-note");
  const email = document.getElementById("calc-email");

  function refresh() {
    if (!form.checkValidity()) {
      size.textContent = "—";
      load.textContent = "—";
      btu.textContent = "—";
      area.textContent = "—";
      note.textContent = "Complete the room details to see an estimate.";
      email.hidden = true;
      return;
    }
    const fields = new FormData(form);
    const input = {
      length: Number(fields.get("length")),
      width: Number(fields.get("width")),
      height: Number(fields.get("height")),
      people: Number(fields.get("people")),
      room: String(fields.get("room")),
      insulation: String(fields.get("insulation")),
      sun: String(fields.get("sun")),
      glazing: String(fields.get("glazing"))
    };
    try {
      const result = estimateCooling(input);
      const format = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
      size.textContent = result.needsSurvey ? "Survey advised" : result.suggestedKw.toFixed(1) + " kW";
      load.textContent = result.coolingKw.toFixed(1) + " kW";
      btu.textContent = format.format(Math.round(result.btuPerHour / 100) * 100) + " BTU/h";
      area.textContent = result.area.toFixed(1) + " m²";
      note.textContent = result.needsSurvey
        ? "This space needs a closer assessment of glazing, heat gains and air distribution before choosing equipment."
        : result.solarCaution
          ? "Large sunny windows can cause substantial heat gain. We’ll check glazing and shading before confirming the size."
          : "This is an indicative cooling-only recommendation. The final model and capacity are confirmed after assessment.";

      const roomLabel = form.elements.namedItem("room").selectedOptions[0].text;
      const insulationLabel = form.elements.namedItem("insulation").selectedOptions[0].text;
      const sunLabel = form.elements.namedItem("sun").selectedOptions[0].text;
      const glazingLabel = form.elements.namedItem("glazing").selectedOptions[0].text;
      const subject = "AIR HVAC room sizing and installation enquiry";
      const body = [
        "Hello AIR HVAC,",
        "",
        "I used your room cooling-size calculator and would like advice or a quote.",
        "",
        "Room type: " + roomLabel,
        "Room dimensions: " + input.length + "m × " + input.width + "m × " + input.height + "m",
        "Floor area: " + result.area.toFixed(1) + "m²",
        "Insulation: " + insulationLabel,
        "Sun exposure: " + sunLabel,
        "Window area: " + glazingLabel,
        "People: " + input.people,
        "Estimated cooling load: " + result.coolingKw.toFixed(1) + "kW",
        "Indicative unit: " + (result.needsSurvey ? "Survey advised" : result.suggestedKw.toFixed(1) + "kW"),
        "",
        "Property postcode: ",
        "Preferred installation location: ",
        "",
        "I can attach photos of the room, windows and proposed outdoor unit position.",
        "",
        "Thank you."
      ].join("\n");
      email.href = "mailto:info@airhvac.co.uk?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      email.hidden = false;
    } catch (_error) {
      size.textContent = "—";
      load.textContent = "—";
      btu.textContent = "—";
      area.textContent = "—";
      note.textContent = "Please check your dimensions and try again.";
      email.hidden = true;
    }
  }

  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (form.reportValidity()) refresh();
  });
  refresh();
})();
