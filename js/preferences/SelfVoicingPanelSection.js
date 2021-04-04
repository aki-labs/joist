// Copyright 2021, University of Colorado Boulder

/**
 * The section of PreferencesDialog content in the "Audio" panel related to self-voicing.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import voicingManager from '../../../scenery/js/accessibility/speaker/voicingManager.js';
import webSpeaker from '../../../scenery/js/accessibility/speaker/webSpeaker.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../sun/js/ComboBoxItem.js';
import ExpandCollapseButton from '../../../sun/js/ExpandCollapseButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import joist from '../joist.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const selfVoicingLabelString = 'Voicing';
const toolbarLabelString = 'Toolbar';
const rateString = 'Rate';
const pitchString = 'Pitch';
const selfVoicingEnabledString = 'Voicing on.';
const voiceVariablesPatternString = '{{value}}x';
const voicingDescriptionString = 'Info will be voiced when enabled.';

class SelfVoicingPanelSection extends PreferencesPanelSection {

  /**
   * @param {BooleanProperty} toolbarEnabledProperty - whether or not the Toolbar is enabled for use
   */
  constructor( toolbarEnabledProperty ) {

    // the checkbox is the title for the section and totally enables/disables the feature
    const selfVoicingLabel = new Text( selfVoicingLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const voicingSwitch = new PreferencesToggleSwitch( webSpeaker.enabledProperty, false, true, {
      labelNode: selfVoicingLabel,
      descriptionNode: new Text( voicingDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT
      } )
    } );

    // checkbox for the toolbar
    const quickAccessLabel = new Text( toolbarLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const toolbarSwitch = new PreferencesToggleSwitch( toolbarEnabledProperty, false, true, {
      labelNode: quickAccessLabel
    } );

    // Speech output levels
    const speechOutputLabel = new Text( 'Speech Output Levels', { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const speechOutputCheckboxes = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        createCheckbox( 'Object Changes and Screen Text', voicingManager.objectChangesProperty ),
        createCheckbox( 'Context Changes', voicingManager.contextChangesProperty ),
        createCheckbox( 'Helpful Hints', voicingManager.hintsProperty )
      ]
    } );

    const speechOutputContent = new Node( {
      children: [ speechOutputLabel, speechOutputCheckboxes ]
    } );
    speechOutputCheckboxes.leftTop = speechOutputLabel.leftBottom.plusXY( 15, 5 );

    // voice options
    const voiceOptionsLabel = new Text( 'Voice Options', {
      font: PreferencesDialog.PANEL_SECTION_LABEL_FONT
    } );

    // only grab the first 12 options for the ComboBox, its all we have space for
    const parentNode = phet.joist.sim.topLayer;
    const comboBoxItems = [];
    webSpeaker.voices.slice( 0, 12 ).forEach( voice => {
      const textNode = new Text( voice.name, { font: PreferencesDialog.CONTENT_FONT } );
      comboBoxItems.push( new ComboBoxItem( textNode, voice, {
        a11yLabel: voice.name
      } ) );
    } );
    const voiceComboBox = new ComboBox( comboBoxItems, webSpeaker.voiceProperty, parentNode, {
      listPosition: 'above'
    } );

    const rateSlider = new VoiceRateNumberControl( rateString, webSpeaker.voiceRateProperty );
    const pitchSlider = new VoicingPitchSlider( pitchString, webSpeaker.voicePitchProperty );
    const voiceOptionsContent = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        rateSlider,
        pitchSlider,
        voiceComboBox
      ]
    } );

    // controls visibility of voice options
    const voiceOptionsOpenProperty = new BooleanProperty( false );
    const expandCollapseButton = new ExpandCollapseButton( voiceOptionsOpenProperty, { sideLength: 16 } );

    const content = new Node( {
      children: [ speechOutputContent, toolbarSwitch, voiceOptionsLabel, expandCollapseButton, voiceOptionsContent ]
    } );

    // layout for section content, custom rather than using a LayoutBox because the voice options label needs
    // to be left aligned with other labels, while the ExpandCollapseButton extends to the left
    toolbarSwitch.leftTop = speechOutputContent.leftBottom.plusXY( 0, 20 );
    voiceOptionsLabel.leftTop = toolbarSwitch.leftBottom.plusXY( 0, 20 );
    expandCollapseButton.leftCenter = voiceOptionsLabel.rightCenter.plusXY( 10, 0 );
    voiceOptionsContent.leftTop = voiceOptionsLabel.leftBottom.plusXY( 0, 10 );
    voiceOptionsOpenProperty.link( open => { voiceOptionsContent.visible = open; } );

    super( {
      titleNode: voicingSwitch,
      contentNode: content
    } );

    webSpeaker.enabledProperty.link( enabled => {
      content.visible = enabled;
    } );

    // webSpeaker.enabledProperty.link( enabled => SunConstants.componentEnabledListener( enabled, content ) );

    // Speak when self-voicing becomes initially enabled. First speech is done synchronously (not using utterance-queue)
    // in response to user input, otherwise all speech will be blocked on many platforms
    webSpeaker.enabledProperty.lazyLink( enabled => {
      if ( enabled ) {
        webSpeaker.initialSpeech( selfVoicingEnabledString );
      }
    } );
  }
}

/**
 * Create a checkbox for the features of self-voicing content with a label.
 * @param {string} labelString
 * @param {BooleanProperty} property
 * @returns {Checkbox}
 */
const createCheckbox = ( labelString, property ) => {
  const labelNode = new Text( labelString, { font: PreferencesDialog.CONTENT_FONT } );
  return new Checkbox( labelNode, property );
};

/**
 * Create a NumberControl for one of the voice parameters of self-voicing (pitch/rate).
 *
 * @param {string} labelString - label for the NumberControl
 * @param {NumberProperty} voiceRateProperty
 * @returns {NumberControl}
 */
class VoiceRateNumberControl extends NumberControl {
  constructor( labelString, voiceRateProperty ) {
    super( labelString, voiceRateProperty, voiceRateProperty.range, {
      includeArrowButtons: false,
      layoutFunction: NumberControl.createLayoutFunction4(),
      delta: 0.25,
      titleNodeOptions: {
        font: PreferencesDialog.CONTENT_FONT
      },
      numberDisplayOptions: {
        decimalPlaces: 2,
        valuePattern: voiceVariablesPatternString,
        textOptions: {
          font: PreferencesDialog.CONTENT_FONT
        }
      },
      sliderOptions: {
        thumbSize: new Dimension2( 13, 26 ),
        trackSize: new Dimension2( 100, 5 ),
        keyboardStep: 0.25
      }
    } );
  }
}

/**
 * A slider with labels and tick marks used to control voice rate of web speech synthesis.
 *
 * @param {string} labelString
 * @param {NumberProperty} voicePitchProperty
 * @returns {VBox}
 */
class VoicingPitchSlider {

  /**
   * @param labelString
   * @param voicePitchProperty
   * @returns {VBox}
   */
  constructor( labelString, voicePitchProperty ) {
    const label = new Text( labelString, { font: PreferencesDialog.CONTENT_FONT } );
    const slider = new HSlider( voicePitchProperty, voicePitchProperty.range, {
      majorTickLength: 10
    } );

    const lowLabel = new Text( 'Low', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchProperty.range.min, lowLabel );

    const highLabel = new Text( 'High', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchProperty.range.max, highLabel );

    return new VBox( {
      children: [ label, slider ],
      align: 'left',
      spacing: 5
    } );
  }
}

joist.register( 'SelfVoicingPanelSection', SelfVoicingPanelSection );
export default SelfVoicingPanelSection;