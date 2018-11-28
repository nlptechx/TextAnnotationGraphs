/**
 * Manages the user-provided taxonomy tree, and the colouring of the
 * associated elements in the visualisation
 */

const randomColor = require("randomcolor");
const yaml = require("js-yaml");

import ColorPicker from "../colorpicker.js";
import Word from "../components/word.js";

class TaxonomyManager {
  constructor() {
    // The currently loaded taxonomy (as a JS Array representing the tree)
    this.taxonomy = [];

    // The originally-loaded taxonomy string (as a YAML document)
    this.taxonomyYaml = "";

    // Tag->Colour assignments for the currently loaded taxonomy
    this.tagColours = {};

    // An array containing the first n default colours to use (as a queue).
    // When this array is exhausted, we will switch to using randomColor.
    this.defaultColours = [
      "#3fa1d1",
      "#ed852a",
      "#2ca02c",
      "#c34a1d",
      "#a048b3",
      "#e377c2",
      "#bcbd22",
      "#17becf",
      "#e7298a",
      "#e6ab02",
      "#7570b3",
      "#a6761d",
      "#7f7f7f"
    ];
  }

  /**
   * Loads a new taxonomy specification (in YAML form) into the module
   * @param {String} taxonomyYaml - A YAML string representing the taxonomy
   *   object
   */
  loadTaxonomyYaml(taxonomyYaml) {
    this.taxonomy = yaml.safeLoad(taxonomyYaml);
    this.taxonomyYaml = taxonomyYaml;
  }

  /**
   * Returns a YAML representation of the currently loaded taxonomy
   */
  getTaxonomyYaml() {
    return this.taxonomyYaml;
  }

  /**
   * Returns the currently loaded taxonomy as an Array.
   * Simple labels are stored as Strings in Arrays, and category labels are
   * stored as single-key objects.
   *
   * E.g., a YAML document like the following:
   *
   *  - Label A
   *  - Category 1:
   *    - Label B
   *    - Label C
   *  - Label D
   *
   * Parses to the following taxonomy object:
   *
   *  [
   *    "Label A",
   *    {
   *      "Category 1": [
   *        "Label B",
   *        "Label C"
   *      ]
   *    },
   *    "Label D"
   *  ]
   *
   * @return {Array}
   */
  getTaxonomyTree() {
    return this.taxonomy;
  }

  /**
   * Given some array of Words, recolours them according to the currently
   * loaded taxonomy.
   * If the word has a WordTag that we are not currently tracking, it will
   * be assigned a colour from the default colours list.
   * @param {Array} words
   */
  colour(words) {
    words.forEach(word => {
      // Words with WordTags
      if (word.tag) {
        if (!this.tagColours[word.tag.val]) {
          // We have yet to assign this tag a colour
          this.assignColour(word.tag.val, this.getNewColour());
        }
        TaxonomyManager.setColour(word, this.tagColours[word.tag.val]);
      }

      // Words with WordClusters
      if (word.clusters.length > 0) {
        word.clusters.forEach(cluster => {
          if (!this.tagColours[cluster.val]) {
            this.assignColour(cluster.val, this.getNewColour());
          }
          TaxonomyManager.setColour(cluster, this.tagColours[cluster.val]);
        });
      }
    });
  }

  /**
   * Synonym for `.colour()`
   * @param words
   * @return {*}
   */
  color(words) {
    return this.colour(words);
  }

  /**
   * Given some label in the visualisation (either for a WordTag or a
   * WordCluster), assigns it a colour that will be reflected the next time
   * `.colour()` is called.
   */
  assignColour(label, colour) {
    this.tagColours[label] = colour;
  }

  /**
   * Given some element in the visualisation, change its colour
   * @param element
   * @param colour
   */
  static setColour(element, colour) {
    if (element instanceof Word) {
      // Set the colour of the tag
      element.tag.svgText.node.style.fill = colour;
    } else {
      // Set the colour of the element itself
      element.svgText.node.style.fill = colour;
    }
  }

  /**
   * Given some label (either for a WordTag or WordCluster), return the
   * colour that the taxonomy manager has assigned to it
   * @param label
   */
  getColour(label) {
    return this.tagColours[label];
  }

  /**
   * Returns a colour for a new tag.  Will pop from `.defaultColours` first,
   * then fall back to `randomColor()`
   */
  getNewColour() {
    if (this.defaultColours.length > 0) {
      return this.defaultColours.shift();
    } else {
      return randomColor();
    }
  }


}

module.exports = TaxonomyManager;
