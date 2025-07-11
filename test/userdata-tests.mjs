import assert from "assert";
import SourceLibrary from "../src/library.mjs";

describe("User Data tests >", () => {
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
    assert.strictEqual(errors[0], "JSON5: invalid character '}' at 14:11");
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

describe("User File Name Tests >", () => {
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
