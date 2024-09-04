import assert from "assert";
import { MockActor, MockItem } from "./test-stubs.mjs";
import SourceLibrary from "../src/library.mjs";

describe("Torch Library Tests >", () => {
  describe("library.applyFieldDefaults() tests >", () => {
    // `applyFieldDefaults(lib, ref)` allows for defaulting the values of fields, allowing source and user libraries to be more succinct.
    // It is called with a single parameter when the system-supplied library of sources is statically loaded.
    // It is called with two parameters when the user-supplied library is loaded, using the system-supplied library as a reference.
    // In either case, it is the library supplied as the first parameter only that is adjusted with the defaults.

    it("applyFieldDefaults(systemLib) - defaults are all applied", () => {
      /* eslint-disable prettier/prettier */
      let lib = {
        fakeSystem: {
          sources: {
            nuke: { light: { bright: 5, dim: 10, angle: 360 } },
            other: { light: [{ bright: 10, dim: 20, angle: 360 }] },
          },
          aliases: { bomb: "nuke", alt: "other" },
        },
      };
      let expectedSystem = {
        system: "fakeSystem", topology: "standard", quantity: "quantity",
        sources: {
          nuke: { name: "nuke", type: "equipment", consumable: false, states: 2, light: [{ bright: 5, dim: 10, angle: 360 }] },
          other: { name: "other", type: "equipment", consumable: false, states: 2, light: [{ bright: 10, dim: 20, angle: 360 }] },
          bomb: { name: "bomb", type: "equipment", consumable: false, states: 2, light: [{ bright: 5, dim: 10, angle: 360 }] },
          alt: { name: "alt", type: "equipment", consumable: false, states: 2, light: [{ bright: 10, dim: 20, angle: 360 }] },
        },
        aliases: { bomb: "nuke", alt: "other" },
      };
      /* eslint-enable prettier/prettier */
      SourceLibrary.applyFieldDefaults(lib);
      assert.deepEqual(lib["fakeSystem"], expectedSystem);
    });
    // If value is missing from user-defined library, values from reference library are used if present.
    // If not, system-wide defaults are used.
    // Because defaults are applied to the reference library, in theory, the latter should only happen for systems that don't appear in the reference library.
    // In this tests, "nuke" is the source that only appears in the user library, while "other" appears in both.
    // The user library creates "crazy" from the system library's "special" because of the alias, but special is not added to the user library.
    it("applyFieldDefaults(userLib, systemLib) - defaults are all applied", () => {
      /* eslint-disable prettier/prettier */
      let lib = {
        fakeSystem: {
          sources: {
            nuke: { light: { bright: 5, dim: 10, angle: 360 } },
            other: { light: [{ bright: 10, dim: 20, angle: 360 }] },
          },
          aliases: { crazy: "special" },
        },
      };
      let ref = {
        fakeSystem: {
          topology: "gurps", quantity: "amount", sources: {
            other: { type: "spell", consumable: true, states: 2, light: [{ bright: 15, dim: 30, angle: 57 }] },
            special: { type: "equipment", consumable: false, states: 2, light: [{ bright: 20, dim: 35, angle: 90 }] },
          },
        },
      };
      let expectedSystem = {
        system: "fakeSystem", topology: "gurps", quantity: "amount", sources: {
          nuke: { name: "nuke", type: "equipment", consumable: false, states: 2, light: [{ bright: 5, dim: 10, angle: 360 }] },
          other: { name: "other", type: "spell", consumable: true, states: 2, light: [{ bright: 10, dim: 20, angle: 360 }] },
          crazy: { name: "crazy", type: "equipment", consumable: false, states: 2, light: [{ bright: 20, dim: 35, angle: 90 }] },
        },
        aliases: { crazy: "special" },
      };
      /* eslint-enable prettier/prettier */
      SourceLibrary.applyFieldDefaults(lib, ref);
      assert.deepEqual(lib["fakeSystem"], expectedSystem);
    });
    it("applyFieldDefaults(systemLib) - defaults do not override actual data", () => {
      /* eslint-disable prettier/prettier */
      let lib = {
        fakeSystem: {
          system: "aSystem", // While this test shows it is permitted, it isn't wise to change the system property to not match the key.
          topology: "gurps", quantity: "count", sources: {
            nuke: { name: "Nuke2", type: "spell", consumable: true, states: 3, light: [ { bright: 15, dim: 20, angle: 360 }, { bright: 20, dim: 40, angle: 57 } ] },
            other: { name: "Other", type: "spell", consumable: false, states: 2, light: [{ bright: 10, dim: 20, angle: 360 }] },
          },
        },
      };
      let expectedSystem = {
        system: "aSystem", topology: "gurps", quantity: "count", sources: {
          nuke: { name: "Nuke2", type: "spell", consumable: true, states: 3, light: [ { bright: 15, dim: 20, angle: 360 }, { bright: 20, dim: 40, angle: 57 } ] },
          other: { name: "Other", type: "spell", consumable: false, states: 2, light: [{ bright: 10, dim: 20, angle: 360 }] },
        },
      };
      /* eslint-enable prettier/prettier */
      SourceLibrary.applyFieldDefaults(lib);
      assert.deepEqual(lib["fakeSystem"], expectedSystem);
    });
    // This also tests that data from the reference library also does not override data from the supplied library
    it("applyFieldDefaults(userlib, systemLib) - defaults do not override actual data", () => {
      /* eslint-disable prettier/prettier */
      let lib = {
        fakeSystem: {
          system: "aSystem", topology: "gurps", quantity: "count", sources: {
            nuke: { name: "Nuke2", type: "spell", consumable: "true", states: 3, light: [
                { bright: 15, dim: 20, angle: 360 }, { bright: 20, dim: 40, angle: 57 },
              ],
            },
            other: { name: "Other", type: "spell", consumable: "false", states: 2, light: [{ bright: 10, dim: 20, angle: 360 }] },
          },
        },
      };
      let ref = {
        fakeSystem: {
          topology: "gurps", quantity: "amount", sources: {
            other: { type: "spell", consumable: true, states: 2, light: [{ bright: 15, dim: 30, angle: 57 }] },
          },
        },
      };
      let expectedSystem = {
        system: "aSystem", topology: "gurps", quantity: "count", sources: {
          nuke: { name: "Nuke2", type: "spell", consumable: true, states: 3, light: [
              { bright: 15, dim: 20, angle: 360 }, { bright: 20, dim: 40, angle: 57 },
            ],
          },
          other: { name: "Other", type: "spell", consumable: false, states: 2, light: [{ bright: 10, dim: 20, angle: 360 }] },
        },
      };
      /* eslint-enable prettier/prettier */
      SourceLibrary.applyFieldDefaults(lib, ref);
      assert.deepEqual(lib["fakeSystem"], expectedSystem);
    });
  });

  /* eslint-disable prettier/prettier */
  const testLights = {
    dnd5e: {
      sources: {
        "Phantom Torch": { consumable: true, light: { bright: 5, dim: 20, angle: 360, color: "#ff9329", alpha: 0.6 } },
        Candle: { consumable: true, light: [ 
          { bright: 10, dim: 15, angle: 360, color: "#ff9329", alpha: 0.5, animation: { type: "torch", speed: 5, intensity: 5, reverse: false } }
        ]},
      },
    },
    test: {
      topology: "gurps", sources: {
        Flashlight: { light: { bright: 10, dim: 0, angle: 3, color: "#ffd6aa", alpha: 1.0 } },
      },
    },
  };
  /* eslint-enable prettier/prettier */

  describe("library.load() tests >", () => {
    beforeEach(function () {});
    afterEach(function () {
      SourceLibrary.commonLibrary = undefined;
    });
    it("library load for D&D 5e without a user library", async () => {
      assert.equal(
        SourceLibrary.commonLibrary,
        undefined,
        "no common library loaded initially",
      );
      let library = await SourceLibrary.load("dnd5e", 10, 50, "Torch");
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let candle = library.getLightSource("candle");
      assert.deepEqual(
        candle.light[0],
        { bright: 5, dim: 10, angle: 360 },
        "candle from common came in correctly",
      );
      let torch = library.getLightSource("torch");
      assert.deepEqual(
        torch.light[0],
        { bright: 10, dim: 50 },
        "torch brightness from settings came in correctly",
      );
      let phantom = library.getLightSource("phantom torch");
      assert.equal(phantom, undefined, "No phantom torch defined as expected");
    });
    it("library load for D&D 5e with no user inventory item set", async () => {
      assert.equal(
        SourceLibrary.commonLibrary,
        undefined,
        "no common library loaded initially",
      );
      let library = await SourceLibrary.load("dnd5e", 50, 10, undefined);
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let candle = library.getLightSource("candle");
      assert.deepEqual(
        candle.light[0],
        { bright: 5, dim: 10, angle: 360 },
        "candle from common came in correctly",
      );
      let torch = library.getLightSource("torch");
      assert.deepEqual(
        torch.light[0],
        { bright: 20, dim: 40, angle: 360 },
        "torch from common came in correctly",
      );
    });
    it("library load for D&D 5e with a user library", async () => {
      assert.equal(
        SourceLibrary.commonLibrary,
        undefined,
        "no common library loaded initially",
      );
      /* eslint-disable-next-line prettier/prettier */
      let library = await SourceLibrary.load("dnd5e", 10, 50, "Torch", testLights);
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let torch = library.getLightSource("torch");
      assert.deepEqual(
        torch.light[0],
        { bright: 10, dim: 50 },
        "torch brightness from settings came in correctly",
      );
      let candle = library.getLightSource("candle");
      assert.deepEqual(
        candle.light[0],
        /* eslint-disable-next-line prettier/prettier */
        { bright: 10, dim: 15, angle: 360, color: "#ff9329", alpha: 0.5, animation: { type: "torch", speed: 5, intensity: 5, reverse: false } },
        "candle from user library came in correctly",
      );
      let phantom = library.getLightSource("phantom torch");
      assert.ok(phantom, "The phantom torch light source exists in the data");
      assert.deepEqual(
        phantom.light[0],
        { bright: 5, dim: 20, angle: 360, color: "#ff9329", alpha: 0.6 },
        "phantom from user library came in correctly",
      );
    });
    it("library load for GURPS with a user library with a GURPS flashlight", async () => {
      assert.equal(
        SourceLibrary.commonLibrary,
        undefined,
        "no common library loaded initially",
      );
      let library = await SourceLibrary.load(
        "test",
        50,
        10,
        "Torch",
        testLights,
      );
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let candle = library.getLightSource("candle");
      assert.equal(candle, undefined, "No candle defined as expected");
      let selfSource = library.getLightSource("self");
      assert.equal(
        selfSource,
        undefined,
        "No self light source defined as expected",
      );
      let flashlight = library.getLightSource("flashlight");
      assert.ok(flashlight, "Flashlight defined as expected");
      assert.deepEqual(
        flashlight.light[0],
        { bright: 10, dim: 0, angle: 3, color: "#ffd6aa", alpha: 1.0 },
        "user flashlight light settings match",
      );
    });
  });
  describe("Standard library topology test >", () => {
    it("Actor inventory settings for Versatile in D&D5e with a user library", async () => {
      /* eslint-disable-next-line prettier/prettier */
      let library = await SourceLibrary.load("dnd5e", 50, 10, "Torch", testLights);
      let versatile = {
        items: [
          new MockItem("Torch", 5),
          new MockItem("Candle", 5),
          new MockItem("Light"),
          new MockItem("Lamp"),
        ],
      };
      let torches = library.getInventory(versatile, "Torch");
      assert.ok(
        typeof torches === "number",
        "Count of torches has a numeric value",
      );
      let candles = library.getInventory(versatile, "Candle");
      assert.ok(
        typeof candles === "number",
        "Count of candles has a numeric value",
      );
      let lights = library.getInventory(versatile, "Light");
      assert.ok(
        typeof lights === "undefined",
        "Light cantrip doesn't have inventory",
      );
      let lamps = library.getInventory(versatile, "Lamp");
      assert.ok(typeof lamps === "undefined", "Lamp doesn't have inventory");
      await library._presetInventory(versatile, "Torch", 2);
      let before = library.getInventory(versatile, "Torch");
      await library.decrementInventory(versatile, "Torch");
      let afterFirst = library.getInventory(versatile, "Torch");
      await library.decrementInventory(versatile, "Torch");
      let afterSecond = library.getInventory(versatile, "Torch");
      await library.decrementInventory(versatile, "Torch");
      let afterThird = library.getInventory(versatile, "Torch");
      assert.equal(before, 2, "Started with set value");
      assert.equal(afterFirst, 1, "Decremented to one");
      assert.equal(afterSecond, 0, "Decremented to zero");
      assert.equal(afterThird, 0, "Remained at zero");
    });
    it("Actor image settings for Versatile in D&D5e with a user library", async () => {
      /* eslint-disable-next-line prettier/prettier */
      let library = await SourceLibrary.load("dnd5e", 50, 10, "Torch", testLights);
      let versatile = {
        items: [
          new MockItem("Torch", 5),
          new MockItem("Candle", 5),
          new MockItem("Light"),
          new MockItem("Lamp"),
        ],
      };
      let torchImage = library.getImage(versatile, "Torch");
      assert.ok(torchImage, "Torch should have a defined image");
      assert.notEqual(torchImage, "", "Torch image has a reasonable value");
      let candleImage = library.getImage(versatile, "Candle");
      assert.ok(candleImage, "Candle should have a defined image");
      assert.notEqual(candleImage, "", "Candle image has a reasonable value");
      let lampImage = library.getImage(versatile, "Lamp");
      assert.ok(lampImage, "Lamp should have a defined image");
      assert.notEqual(lampImage, "", "Lamp image has a reasonable value");
      let lightImage = library.getImage(versatile, "Light");
      assert.ok(lightImage, "Light cantrip should have a defined image");
      assert.notEqual(
        lightImage,
        "",
        "Light cantrip image has a reasonable value",
      );
    });

    it("Actor light sources for Lightbearer, Breaker, Empty, and Bic in D&D5e with a user library", async () => {
      /* eslint-disable-next-line prettier/prettier */
      let library = await SourceLibrary.load("dnd5e", 50, 10, "Torch", testLights);

      let breaker = {
        items: [new MockItem("Torch"), new MockItem("Dancing Lights")],
      };
      let breakerSources = library.actorLightSources(breaker);
      assert.equal(
        breakerSources.length,
        2,
        "Breaker has two known light sources",
      );
      assert.notEqual(
        breakerSources[0].name,
        breakerSources[1].name,
        "Breaker's sources are different",
      );
      assert.ok(
        ["Torch", "Dancing Lights"].includes(breakerSources[0].name),
        "Breaker's first source is expected",
      );
      assert.ok(
        ["Torch", "Dancing Lights"].includes(breakerSources[1].name),
        "Breaker's second source is expected",
      );
      assert.equal(
        library.actorHasLightSource(breaker, "Dancing Lights"),
        true,
        "Breaker is reported as having Dancing Lights",
      );

      let bearer = { items: [new MockItem("Torch", 5)] };
      let bearerSources = library.actorLightSources(bearer);
      assert.equal(
        bearerSources.length,
        1,
        "Torchbearer has precisely one light source",
      );
      assert.equal(
        bearerSources[0].name,
        "Torch",
        "Torchbearer's light source is Torch, as eqpected",
      );
      assert.equal(
        library.actorHasLightSource(bearer, "Torch"),
        true,
        "Bearer is reported as having the Torch light source",
      );

      let empty = { items: [] };
      let emptySources = library.actorLightSources(empty);
      assert.equal(
        emptySources.length,
        0,
        "Empty truly has no known light sources",
      );
      assert.equal(
        library.actorHasLightSource(empty, "Candle"),
        false,
        "Empty is reported as not having the candle light source",
      );

      let everythingBut = {
        items: [
          new MockItem("Flashlight"),
          new MockItem("Blowtorch", 5),
          new MockItem("Magical Floodlight"),
        ],
      };
      let everythingButSources = library.actorLightSources(everythingBut);
      assert.equal(
        everythingButSources.length,
        0,
        "Bic has no known light sources, even though it has ways of casting light",
      );
      assert.equal(
        library.actorHasLightSource(everythingBut, "Candle"),
        false,
        "Empty is reported as not having the candle light source",
      );
    });
  });
  /* eslint-disable prettier/prettier */
  const MiniFlashlightGURPSSource = 
  {
    image: '/icons/svg/light.svg', name: 'Mini Flashlight', type: 'equipment', consumable: false, states: 2, light: {
      0: { bright: 4, dim: 5, angle: 6, color: '#ffd6aa', alpha: 1 }
    }
  };
  const TorchGURPSSource = 
  {
    image: '/icons/svg/light.svg', name: 'Torch', type: 'equipment', consumable: true, states: 2, light: {
      0: { bright: 9, dim: 10, angle: 360, color: '#ff9329', alpha: 1 }
    },
  };
  /* eslint-enable prettier/prettier */

  describe("GURPS Library topology test >", () => {
    beforeEach(function () {});
    afterEach(function () {
      SourceLibrary.commonLibrary = undefined;
    });

    it("Actor light sources for Theodore in GURPS with no user library", async () => {
      /* eslint-disable-next-line prettier/prettier */
      let library = await SourceLibrary.load("gurps", 50, 10, undefined);
      let items = [new MockItem("Mini Flashlight"), new MockItem("Torch")];
      let theodore = new MockActor("12345", "Theodore", items, 20, 40);
      theodore.findEquipmentByNameMethod = (name) => {
        switch (name) {
          case "Mini Flashlight":
            return [theodore.items[0], "F"];
          case "Torch":
            return [theodore.items[1], "T"];
          default:
            return [undefined, undefined];
        }
      };
      let theodoreSources = library.actorLightSources(theodore);
      assert.deepEqual(
        theodoreSources,
        [MiniFlashlightGURPSSource, TorchGURPSSource],
        "Theodore has the expected set of sources",
      );
      assert.equal(
        library.actorHasLightSource(theodore, "Torch"),
        true,
        "Theodore has a torch",
      );
    });
    it("Actor inventory and image settings for Theodore in GURPS with a user library", async () => {
      /* eslint-disable-next-line prettier/prettier */
      let library = await SourceLibrary.load("gurps", 50, 10, undefined);
      let items = [new MockItem("Mini Flashlight"), new MockItem("Torch")];
      let theodore = new MockActor("12345", "Theodore", items, 20, 40);
      theodore.findEquipmentByNameMethod = (name) => {
        switch (name) {
          case "Mini Flashlight":
            return [theodore.items[0], "F"];
          case "Torch":
            return [theodore.items[1], "T"];
          default:
            return [undefined, undefined];
        }
      };
      theodore.updateEqtCountDataMethod = (key, value) => {
        switch (key) {
          case "F":
            theodore.items[0].count = value;
            break;
          case "T":
            theodore.items[1].count = value;
            break;
          default:
            assert.fail(
              "Updated equipment count of somethign Theodore doesn't have",
            );
        }
      };
      items[1].count = 5;
      let torches = library.getInventory(theodore, "Torch");
      assert.ok(
        typeof torches === "number",
        "Count of torches has a numeric value",
      );
      await library._presetInventory(theodore, "Torch", 2);
      let before = library.getInventory(theodore, "Torch");
      await library.decrementInventory(theodore, "Torch");
      let afterFirst = library.getInventory(theodore, "Torch");
      await library.decrementInventory(theodore, "Torch");
      let afterSecond = library.getInventory(theodore, "Torch");
      await library.decrementInventory(theodore, "Torch");
      let afterThird = library.getInventory(theodore, "Torch");
      assert.equal(before, 2, "Started with set value");
      assert.equal(afterFirst, 1, "Decremented to one");
      assert.equal(afterSecond, 0, "Decremented to zero");
      assert.equal(afterThird, 0, "Remained at zero");

      let torchImage = library.getImage(theodore, "Torch");
      assert.ok(torchImage, "Torch should have a defined image");
      assert.notEqual(torchImage, "", "Torch image has a reasonable value");
    });
  });
  describe("Default Library topology test >", () => {
    beforeEach(function () {});
    afterEach(function () {
      SourceLibrary.commonLibrary = undefined;
    });
    it("Actor light sources for Enigma in random system with no user library", async () => {
      /* eslint-disable-next-line prettier/prettier */
      let library = await SourceLibrary.load("random", 10, 50, undefined);
      let items = [new MockItem("Mini Flashlight"), new MockItem("Torch")];
      let enigma = new MockActor("12345", "Enigma", items, 20, 40);
      let sources = library.actorLightSources(enigma);
      assert.deepEqual(
        sources,
        [
          {
            name: "Self",
            type: "none",
            consumable: false,
            image: "/icons/svg/light.svg",
            states: 2,
            light: {
              0: { angle: 360, bright: 10, dim: 50 },
            },
          },
        ],
        "Enigma has the expected set of sources",
      );
      assert.equal(
        library.actorHasLightSource(enigma, "Self"),
        true,
        "Enigma has himself",
      );
      assert.equal(
        library.actorHasLightSource(enigma, "Other"),
        false,
        "Enigma has no other",
      );
      assert.strictEqual(
        1,
        library.getInventory(enigma, "Self"),
        "Enigma has only one self",
      );
    });
  });

  describe("library.applyFieldDefaults() tests >", () => {
    it("Loads valid JSON configuration successfully", async () => {
      const TESTDATA = `{
        "dnd5e": {
          "sources": {
            "Phantom Torch": {
              "consumable": true,
              "light": [
                {
                  "bright": 5,
                  "dim": 20,
                  "angle": 360,
                  "color": "#ff9329",
                  "alpha": 0.6
                }
              ]
            }
          }
        }
      }`;
      const EXPECTED = {
        dnd5e: {
          sources: {
            "Phantom Torch": {
              consumable: true,
              light: [
                {
                  bright: 5,
                  dim: 20,
                  angle: 360,
                  color: "#ff9329",
                  alpha: 0.6,
                },
              ],
            },
          },
        },
      };
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors, undefined);
    });

    it("Loads valid JSON5 configuration that isn't valid JSON successfully", async () => {
      // Starting with JSON5 test data - note the comment and the trailing commas
      const TESTDATA = `{
        "dnd5e": {
          "sources": {
            "Phantom Torch": { // The torch you never see, just its effect
              "consumable": true,
              "light": [
                {
                  "bright": 5,
                  "dim": 20,
                  "angle": 360,
                  "color": "#ff9329",
                  "alpha": 0.6,
                },
              ],
            },
          },
        },
      }`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = {
        dnd5e: {
          sources: {
            "Phantom Torch": {
              consumable: true,
              light: [
                {
                  bright: 5,
                  dim: 20,
                  angle: 360,
                  color: "#ff9329",
                  alpha: 0.6,
                },
              ],
            },
          },
        },
      };
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors, undefined);
    });

    it("Loads valid JSON5 configuration with non-array light configs successfully", async () => {
      // Starting with JSON5 test data - note the comment and the trailing commas
      const TESTDATA = `{
        "dnd5e": {
          "sources": {
            "Phantom Torch": {
              "consumable": true,
              "light": {
                  "bright": 5,
                  "dim": 20,
                  "angle": 360,
                  "color": "#ff9329",
                  "alpha": 0.6          
              },
            },
          },
        },
      }`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = {
        dnd5e: {
          sources: {
            "Phantom Torch": {
              consumable: true,
              light: {
                bright: 5,
                dim: 20,
                angle: 360,
                color: "#ff9329",
                alpha: 0.6,
              },
            },
          },
        },
      };
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors, undefined);
    });

    it("Loads valid YAML configuration successfully", async () => {
      // Indentation matters in yaml so I have to make the constant data flush left
      //eslint-disable-next-line prettier/prettier
      const TESTDATA = 
`---
dnd5e:
  sources:
    Phantom Torch:
      consumable: true
      light:
      - bright: 5
        dim: 20
        angle: 360
        color: "#ff9329"
        alpha: 0.6
`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = {
        dnd5e: {
          sources: {
            "Phantom Torch": {
              consumable: true,
              light: [
                {
                  bright: 5,
                  dim: 20,
                  angle: 360,
                  color: "#ff9329",
                  alpha: 0.6,
                },
              ],
            },
          },
        },
      };
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors, undefined);
    });

    it("Loads valid YAML configuration with non-array light configs successfully", async () => {
      // Indentation matters in yaml so I have to make the constant data flush left
      //eslint-disable-next-line prettier/prettier
      const TESTDATA =
`---
dnd5e:
  sources:
    Phantom Torch:
      consumable: true
      light:
        bright: 5
        dim: 20
        angle: 360
        color: "#ff9329"
        alpha: 0.6
`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = {
        dnd5e: {
          sources: {
            "Phantom Torch": {
              consumable: true,
              light: {
                bright: 5,
                dim: 20,
                angle: 360,
                color: "#ff9329",
                alpha: 0.6,
              },
            },
          },
        },
      };
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors, undefined);
    });

    it("Gives expected errors on invalid JSON5 syntax", async () => {
      const TESTDATA = `{
        "dnd5e": {
          "sources": {
            "Phantom Torch": { // The torch you never see, just its effect
              "consumable": true,
              "light": [
                {
                  "bright": 5,
                  "dim": 20,
                  "angle": 360,
                  "color": "#ff9329",
                  "alpha": 0.6,
                },
            },
          },
        },
      }`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = undefined;
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors.length, 1);
      assert.strictEqual(errors[0], "JSON5: invalid character '}' at 14:13");
    });
    it("Gives expected errors on invalid YAML syntax", async () => {
      // Indentation matters in yaml so I have to make the constant data flush left
      //eslint-disable-next-line prettier/prettier
      const TESTDATA =
`---
dnd5e:
  sources:
    Phantom Torch:
    consumable: true
      light:
      + bright: 5
        dim: 20
        angle: 360
        color: "#ff9329"
        alpha: 0.6
`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = undefined;
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors.length, 1);
      assert.equal(
        errors[0],
        "bad indentation of a mapping entry (6:12)\n" +
          "\n" +
          " 3 |   sources:\n" +
          " 4 |     Phantom Torch:\n" +
          " 5 |     consumable: true\n" +
          " 6 |       light:\n" +
          "----------------^\n" +
          " 7 |       + bright: 5\n" +
          " 8 |         dim: 20",
      );
    });
    it("Gives expected errors when values and types in JSON are invalid", async () => {
      // Starting with JSON5 test data - note the comment and the trailing commas
      const TESTDATA = `{
        "dnd5e": {
          "sources": {
            "Phantom Torch": { // The torch you never see, just its effect
              "consumable": "true",
              "light": [
                {
                  "bright": -20,
                  "dim": 20,
                  "angle": -90,
                  "color": "#ff9329",
                  "alpha": 0.6,
                },
              ],
            },
          },
        },
      }`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = {
        dnd5e: {
          sources: {
            "Phantom Torch": {
              consumable: "true",
              light: [
                {
                  bright: -20,
                  dim: 20,
                  angle: -90,
                  color: "#ff9329",
                  alpha: 0.6,
                },
              ],
            },
          },
        },
      };
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors.length, 1);
      assert.strictEqual(
        errors[0],
        'type at path "/dnd5e/sources/Phantom Torch/consumable" must be boolean',
      );
    });
    it("Gives expected errors when values and types in YAML are invalid", async () => {
      // Indentation matters in yaml so I have to make the constant data flush left
      //eslint-disable-next-line prettier/prettier
      const TESTDATA =
`---
dnd5e:
  sources:
    Phantom Torch:
      consumable: "true"
      light:
      - bright: -20
        dim: 20
        angle: -90
        color: "#ff9329"
        alpha: 0.6
`;
      // The expected result serializes to the corresponding pure JSON
      const EXPECTED = {
        dnd5e: {
          sources: {
            "Phantom Torch": {
              consumable: "true",
              light: [
                {
                  bright: -20,
                  dim: 20,
                  angle: -90,
                  color: "#ff9329",
                  alpha: 0.6,
                },
              ],
            },
          },
        },
      };
      const [errors, userData] = await SourceLibrary.validateSourceJSON(
        TESTDATA,
        false,
      );
      assert.deepStrictEqual(userData, EXPECTED);
      assert.equal(errors.length, 1);
      assert.equal(
        errors[0],
        'type at path "/dnd5e/sources/Phantom Torch/consumable" must be boolean',
      );
    });
  });
});

describe("Random Construct Tests >", () => {
  const yamlFileCheck = (library) => {
    return [".yaml", ".yml"].includes(
      library.substring(library.lastIndexOf(".")),
    );
  };

  it("Properly detects absence of YAML file extensions in a URL", () => {
    assert.equal(yamlFileCheck("bland-name"), false);
  });
  it("Isn't fooled by yaml extension elsewhere from the end", () => {
    assert.equal(yamlFileCheck("bland-name.yaml.json"), false);
  });
  it("Properly detects presence of YAML file extensions in a URL", () => {
    assert.equal(yamlFileCheck("bland-name.yaml"), true);
  });
  it("Properly detects presence of YML file extensions in a URL", () => {
    assert.equal(yamlFileCheck("bland-name.yml"), true);
  });
});
