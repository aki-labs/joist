// Copyright 2021, University of Colorado Boulder

/**
 * The section of PreferencesDialog content in the "Audio" panel related to self-voicing.
 *
 * @author Jesse Greenberg
 */

import selfVoicingManager from '../../../scenery/js/accessibility/speaker/selfVoicingManager.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import webSpeaker from '../../../scenery/js/accessibility/speaker/webSpeaker.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../sun/js/ComboBoxItem.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import joist from '../joist.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';

// constants
const selfVoicingLabelString = 'Self-Voicing';
const toolbarLabelString = 'Toolbar';
const rateString = 'Rate';
const pitchString = 'Pitch';
const newVoiceRateString = 'New Voice Rate';
const newVoicePitchString = 'New Voice Pitch';

class SelfVoicingPanelSection extends PreferencesPanelSection {

  /**
   * @param {BooleanProperty} toolbarEnabledProperty - whether or not the Toolbar is enabled for use
   */
  constructor( toolbarEnabledProperty ) {

    // the checkbox is the title for the section and totally enables/disables the feature
    const selfVoicingLabel = new Text( selfVoicingLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const selfVoicingCheckbox = new Checkbox( selfVoicingLabel, webSpeaker.enabledProperty );

    // checkbox for the toolbar
    const quickAccessLabel = new Text( toolbarLabelString, { font: PreferencesDialog.CONTENT_FONT } );
    const toolbarCheckbox = new Checkbox( quickAccessLabel, toolbarEnabledProperty );

    // Speech output levels
    const speechOutputLabel = new Text( 'Speech Output Levels', { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const speechOutputVBox = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        speechOutputLabel,
        createCheckbox( 'Object Changes and Screen Text', selfVoicingManager.objectChangesProperty ),
        createCheckbox( 'Context Changes', selfVoicingManager.contextChangesProperty ),
        createCheckbox( 'Helpful Hints', selfVoicingManager.hintsProperty )
      ]
    } );

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

    const rateSlider = createLabelledSlider( rateString, webSpeaker.voiceRateProperty, newVoiceRateString );
    const pitchSlider = createLabelledSlider( pitchString, webSpeaker.voicePitchProperty, newVoicePitchString );
    const voiceOptionsContent = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        voiceOptionsLabel,
        rateSlider,
        pitchSlider,
        voiceComboBox
      ]
    } );
    const content = new VBox( {
      align: 'left',
      spacing: 20,
      children: [
        toolbarCheckbox,
        speechOutputVBox,
        voiceOptionsContent
      ]
    } );
    super( {
      titleNode: selfVoicingCheckbox,
      contentNode: content
    } );

    webSpeaker.enabledProperty.link( enabled => SunConstants.componentEnabledListener( enabled, content ) );
  }

}

const createCheckbox = ( labelString, property ) => {
  const labelNode = new Text( labelString, { font: PreferencesDialog.CONTENT_FONT } );
  return new Checkbox( labelNode, property );
};

const createLabelledSlider = ( labelString, numberProperty, changeSuccessDescription ) => {
  return new NumberControl( labelString, numberProperty, numberProperty.range, {
    includeArrowButtons: false,
    layoutFunction: NumberControl.createLayoutFunction4(),
    sliderOptions: {
      thumbSize: new Dimension2( 13, 26 ),
      trackSize: new Dimension2( 100, 5 ),
      keyboardStep: 1
    }
  } );
};

joist.register( 'SelfVoicingPanelSection', SelfVoicingPanelSection );
export default SelfVoicingPanelSection;