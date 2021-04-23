// Copyright 2021, University of Colorado Boulder

/**
 * The section of PreferencesDialog content in the "Audio" panel related to voicing.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import VoicingText from '../../../scenery-phet/js/accessibility/speaker/VoicingText.js';
import joistStrings from '../joistStrings.js';
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
const voicingLabelString = 'Voicing';
const toolbarLabelString = 'Toolbar';
const rateString = 'Rate';
const pitchString = 'Pitch';
const voicingEnabledString = 'Voicing on.';
const voicingDisabledString = 'Voicing off.';
const voiceVariablesPatternString = '{{value}}x';
const voicingDescriptionString = 'Voices and highlights content as you interact.';

const simVoicingOptionsString = 'Sim Voicing Options';
const simVoicingDescriptionString = 'Choose details you want voiced as you interact.';

const voiceRateDescriptionPatternString = 'Voice Rate {{value}} times';
const voiceRateNormalString = 'Voice Rate normal';
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

const VOICE_PITCH_DESCRIPTION_MAP = new Map();
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 0.5, 0.75 ), 'in low range' );
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 0.75, 1.24 ), 'in normal range' );
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 1.25, 1.49 ), 'above normal range' );
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 1.5, 2 ), 'in high range' );
const voicePitchDescriptionPatternString = 'Voice Pitch {{description}}.';

const THUMB_SIZE = new Dimension2( 13, 26 );
const TRACK_SIZE = new Dimension2( 100, 5 );

class VoicingPanelSection extends PreferencesPanelSection {

  /**
   * @param {BooleanProperty} toolbarEnabledProperty - whether or not the Toolbar is enabled for use
   */
  constructor( toolbarEnabledProperty ) {

    // the checkbox is the title for the section and totally enables/disables the feature
    const voicingLabel = new Text( voicingLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const voicingSwitch = new PreferencesToggleSwitch( webSpeaker.enabledProperty, false, true, {
      labelNode: voicingLabel,
      descriptionNode: new VoicingText( voicingDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        voicingText: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: voicingLabelString,
          description: voicingDescriptionString
        } )
      } )
    } );

    // checkbox for the toolbar
    const quickAccessLabel = new Text( toolbarLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const toolbarSwitch = new PreferencesToggleSwitch( toolbarEnabledProperty, false, true, {
      labelNode: quickAccessLabel
    } );

    // Speech output levels
    const speechOutputLabel = new Text( simVoicingOptionsString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const speechOutputDescription = new VoicingText( simVoicingDescriptionString, {
      font: PreferencesDialog.CONTENT_FONT,
      voicingText: StringUtils.fillIn( labelledDescriptionPatternString, {
        label: simVoicingOptionsString,
        description: simVoicingDescriptionString
      } )
    } );
    const speechOutputCheckboxes = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        createCheckbox( 'Voice direct object changes', voicingManager.objectChangesProperty ),
        createCheckbox( 'Voice other sim changes as objects change', voicingManager.contextChangesProperty ),
        createCheckbox( 'Voice helpful hints on sim interactions', voicingManager.hintsProperty )
      ]
    } );

    const speechOutputContent = new Node( {
      children: [ speechOutputLabel, speechOutputDescription, speechOutputCheckboxes ]
    } );
    speechOutputDescription.leftTop = speechOutputLabel.leftBottom.plusXY( 0, 5 );
    speechOutputCheckboxes.leftTop = speechOutputDescription.leftBottom.plusXY( 15, 5 );

    // voice options
    const voiceOptionsLabel = new Text( 'Customize Voice', {
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

    // Speak when voicing becomes initially enabled. First speech is done synchronously (not using utterance-queue)
    // in response to user input, otherwise all speech will be blocked on many platforms
    webSpeaker.enabledProperty.lazyLink( enabled => {
      webSpeaker.speakImmediately( enabled ? voicingEnabledString : voicingDisabledString );
    } );
  }
}

/**
 * Create a checkbox for the features of voicing content with a label.
 * @param {string} labelString
 * @param {BooleanProperty} property
 * @returns {Checkbox}
 */
const createCheckbox = ( labelString, property ) => {
  const labelNode = new Text( labelString, { font: PreferencesDialog.CONTENT_FONT } );
  return new Checkbox( labelNode, property );
};

/**
 * Create a NumberControl for one of the voice parameters of voicing (pitch/rate).
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
        thumbSize: THUMB_SIZE,
        trackSize: TRACK_SIZE,
        keyboardStep: 0.25
      }
    } );

    voiceRateProperty.lazyLink( rate => {
      const alert = rate === 1 ? voiceRateNormalString : StringUtils.fillIn( voiceRateDescriptionPatternString, {
        value: rate
      } );
      phet.joist.sim.joistVoicingUtteranceQueue.addToBack( alert );
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
class VoicingPitchSlider extends VBox {

  /**
   * @param labelString
   * @param voicePitchProperty
   * @returns {VBox}
   */
  constructor( labelString, voicePitchProperty ) {
    const label = new Text( labelString, { font: PreferencesDialog.CONTENT_FONT } );
    const slider = new HSlider( voicePitchProperty, voicePitchProperty.range, {
      majorTickLength: 10,
      thumbSize: THUMB_SIZE,
      trackSize: TRACK_SIZE,
      keyboardStep: 0.25,
      shiftKeyboardStep: 0.1,

      // constrain the value to the nearest hundredths place so there is no overlap in described ranges in
      // VOICE_PITCH_DESCRIPTION_MAP
      constrainValue: value => Utils.roundToInterval( value, 0.01 )
    } );

    const lowLabel = new Text( 'Low', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchProperty.range.min, lowLabel );

    const highLabel = new Text( 'High', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchProperty.range.max, highLabel );

    super( {
      children: [ label, slider ],
      align: 'left',
      spacing: 5
    } );

    voicePitchProperty.lazyLink( pitch => {
      let pitchDescription;
      VOICE_PITCH_DESCRIPTION_MAP.forEach( ( description, range ) => {
        if ( range.contains( pitch ) ) {
          pitchDescription = description;
        }
      } );
      assert && assert( pitchDescription, `no description found for pitch at value: ${pitch}` );

      const alertString = StringUtils.fillIn( voicePitchDescriptionPatternString, {
        description: pitchDescription
      } );
      phet.joist.sim.joistVoicingUtteranceQueue.addToBack( alertString );
    } );
  }
}

joist.register( 'VoicingPanelSection', VoicingPanelSection );
export default VoicingPanelSection;