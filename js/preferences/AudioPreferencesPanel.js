// Copyright 2021, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing controls related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import HBox from '../../../scenery/js/nodes/HBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import VoicingPanelSection from './VoicingPanelSection.js';
import SoundPanelSection from './SoundPanelSection.js';

// constants
const allAudioString = joistStrings.preferences.tabs.audio.allAudio.title;
const allAudioDescriptionString = joistStrings.preferences.tabs.audio.allAudio.description;

class AudioPreferencesTabPanel extends VBox {

  /**
   * @param {Object} audioOptions - configuration for audio settings, see PreferencesConfiguration
   * @param {BooleanProperty} simSoundProperty - whether sim sound is globally enabled
   * @param {BooleanProperty} enableToolbarProperty - whether the Toolbar is enabled
   */
  constructor( audioOptions, simSoundProperty, enableToolbarProperty ) {

    const panelChildren = [];

    // The voicing feature is not supported with i18n at this time, it should only be enabled and configurable
    // if running in english locale
    // NOTE: This should be for the whole feature, not just the dialog
    if ( phet.chipper.locale === 'en' && audioOptions.supportsVoicing ) {
      panelChildren.push( new VoicingPanelSection( enableToolbarProperty ) );
    }

    if ( audioOptions.supportsSound ) {
      panelChildren.push( new SoundPanelSection( audioOptions ) );
    }

    const sections = new HBox( {
      align: 'top',
      children: panelChildren
    } );

    const allAudioSwitch = new PreferencesToggleSwitch( simSoundProperty, false, true, {
      labelNode: new Text( allAudioString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } ),
      descriptionNode: new Text( allAudioDescriptionString, { font: PreferencesDialog.CONTENT_FONT } )
    } );

    simSoundProperty.link( ( enabled, previousValue ) => { sections.enabled = enabled; } );

    super( {
      align: 'center',
      spacing: 25,
      children: [ allAudioSwitch, sections ]
    } );
  }
}

joist.register( 'AudioPreferencesTabPanel', AudioPreferencesTabPanel );
export default AudioPreferencesTabPanel;