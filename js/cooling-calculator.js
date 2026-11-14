/* AIR HVAC indicative room cooling/heating calculator. No customer data is uploaded. */
(function () {
  "use strict";

  function estimateCooling({ length, width, height, room, insulation, sun, glazing, people }) {
    const coolingRoomFactors = { bedroom: 1, lounge: 1, office: 1.08, kitchen: 1.2, loft: 1.2, conservatory: 1.6 };
    const coolingInsulationFactors = { good: 0.9, average: 1, poor: 1.15 };
    const sunFactors = { shaded: 0.9, typical: 1, sunny: 1.15 };
    const coolingGlazingFactors = { small: 0.95, average: 1, large: 1.15 };

    // Winter demand is a separate, very approximate heat-loss proxy, not the summer heat gain.
    // 70 W/m² at 2.4 m for an average room; fabric/glazing modifiers only. A site heat-loss
    // assessment is essential before final equipment selection, especially at low outdoor temps.
    const heatingRoomFactors = { bedroom: 1, lounge: 1, office: 1, kitchen: 1, loft: 1.15, conservatory: 1.6 };
    const heatingInsulationFactors = { good: 0.72, average: 1, poor: 1.5 };
    const heatingGlazingFactors = { small: 0.9, average: 1, large: 1.2 };

    if (![length, width, height, people].every(Number.isFinite) ||
        length < 1 || length > 30 || width < 1 || width > 30 ||
        height < 2 || height > 6 || people < 1 || people > 20 || !Number.isInteger(people)) {
      throw new RangeError("Please enter valid room measurements and occupant count.");
    }
    if (!(room in coolingRoomFactors) || !(insulation in coolingInsulationFactors) ||
        !(sun in sunFactors) || !(glazing in coolingGlazingFactors)) {
      throw new RangeError("Please choose valid room characteristics.");
    }

    const area = length * width;
    const heightFactor = height / 2.4;
    const coolingKw = area * 0.1 * heightFactor *
      coolingRoomFactors[room] * coolingInsulationFactors[insulation] *
      sunFactors[sun] * coolingGlazingFactors[glazing] +
      Math.max(0, people - 2) * 0.12;
    const heatingKw = area * 0.07 * heightFactor *
      heatingRoomFactors[room] * heatingInsulationFactors[insulation] *
      heatingGlazingFactors[glazing];

    // Nominal split-system classes are an initial conversation starter, NOT a
    // guarantee of available heating output at the local winter design temperature.
    const nominalSizes = [2, 2.5, 3.5, 4.2, 5, 6, 7.1];
    const suggestedKw = nominalSizes.find(size => size + 1e-8 >= Math.max(coolingKw, heatingKw)) ?? null;
    const needsSurvey = room === "conservatory" || area > 50 || height > 3.3 || suggestedKw === null;
    const solarCaution = sun === "sunny" && glazing === "large";

    return {
      area,
      volume: area * height,
      coolingKw,
      btuPerHour: coolingKw * 3412.142,
      heatingKw,
      heatingBtuPerHour: heatingKw * 3412.142,
      suggestedKw,
      needsSurvey,
      solarCaution
    };
  }

  // Export calculations for Node's built-in test runner.
  if (typeof module !== "undefined" && module.exports) module.exports = { estimateCooling };
  if (typeof document === "undefined") return;

  const form = document.getElementById("cooling-calculator-form");
  if (!form) return;

  const size = document.getElementById("calc-size");
  const load = document.getElementById("calc-load");
  const btu = document.getElementById("calc-btu");
  const heating = document.getElementById("calc-heating");
  const heatingBtu = document.getElementById("calc-heating-btu");
  const area = document.getElementById("calc-area");
  const note = document.getElementById("calc-note");
  const email = document.getElementById("calc-email");
  const format = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
  let hasDisplayedEstimate = false;

  // Animate only numbers that actually change. Skip the initial page render.
  function updateSizingValue(element, value) {
    if (element.textContent === value) return;
    element.textContent = value;
    element.classList.remove("calculator-value--changed");
    if (!hasDisplayedEstimate) return;
    // Restart the brief CSS animation, including during consecutive input edits.
    void element.offsetWidth;
    element.classList.add("calculator-value--changed");
  }

  function reset(message) {
    [size, load, btu, heating, heatingBtu, area].forEach(element => {
      element.classList.remove("calculator-value--changed");
      element.textContent = "—";
    });
    hasDisplayedEstimate = false;
    note.textContent = message;
    email.hidden = true;
  }

  function refresh() {
    if (!form.checkValidity()) {
      reset("Check or complete your room measurements to see your estimates.");
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
      const isHeatingLed = result.heatingKw > result.coolingKw;
      updateSizingValue(size, result.needsSurvey ? "Survey advised" : result.suggestedKw.toFixed(1) + " kW");
      updateSizingValue(load, result.coolingKw.toFixed(1) + " kW");
      btu.textContent = format.format(Math.round(result.btuPerHour / 100) * 100) + " BTU/h";
      updateSizingValue(heating, result.heatingKw.toFixed(1) + " kW");
      heatingBtu.textContent = format.format(Math.round(result.heatingBtuPerHour / 100) * 100) + " BTU/h";
      area.textContent = result.area.toFixed(1) + " m²";

      note.textContent = result.needsSurvey
        ? "This room needs a closer assessment before selecting equipment. Please send us the details for advice."
        : isHeatingLed
          ? "Heating is the larger estimated demand. We will check the unit's actual winter heating output before recommending a model."
          : result.solarCaution
            ? "Large sunny windows can cause significant summer heat gain. We will check glazing and shading before confirming a unit."
            : "This is a starting-point system size, not a final specification. We will check cooling gains and winter heating performance.";

      const roomLabel = form.elements.namedItem("room").selectedOptions[0].text;
      const insulationLabel = form.elements.namedItem("insulation").selectedOptions[0].text;
      const sunLabel = form.elements.namedItem("sun").selectedOptions[0].text;
      const glazingLabel = form.elements.namedItem("glazing").selectedOptions[0].text;
      const subject = "AIR HVAC room heating and cooling sizing enquiry";
      const body = [
        "Hello AIR HVAC,",
        "",
        "I used your heating and cooling room calculator and would like advice or a quote.",
        "",
        "Room type: " + roomLabel,
        "Room dimensions: " + input.length + "m × " + input.width + "m × " + input.height + "m",
        "Floor area: " + result.area.toFixed(1) + "m²",
        "Insulation: " + insulationLabel,
        "Sun exposure: " + sunLabel,
        "Window area: " + glazingLabel,
        "People: " + input.people,
        "Indicative summer cooling demand: " + result.coolingKw.toFixed(1) + "kW",
        "Indicative winter heating demand: " + result.heatingKw.toFixed(1) + "kW",
        "Initial nominal system class to discuss: " + (result.needsSurvey ? "Survey advised" : result.suggestedKw.toFixed(1) + "kW"),
        "Heating output at winter design conditions still needs checking.",
        "",
        "Property postcode: ",
        "Preferred indoor / outdoor unit locations: ",
        "",
        "I can attach photos of the room, windows and proposed outdoor unit position.",
        "",
        "Thank you."
      ].join("\n");

      email.href = "mailto:info@airhvac.co.uk?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      email.hidden = false;
      hasDisplayedEstimate = true;
    } catch (_error) {
      reset("Please check your room details and try again.");
    }
  }

  // Inputs always update the result; the form has no calculate button.
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", event => event.preventDefault());
  refresh();
})();
