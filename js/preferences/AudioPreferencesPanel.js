// Copyright 2021, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing controls related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import HBox from '../../../scenery/js/nodes/HBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import SelfVoicingPanelSection from './SelfVoicingPanelSection.js';
import SoundPanelSection from './SoundPanelSection.js';

// constants
const allAudioString = joistStrings.preferences.tabs.audio.allAudio;

class AudioPreferencesTabPanel extends VBox {

  /**
   * @param {Object} audioOptions - configuration for audio settings, see PreferencesConfiguration
   * @param {BooleanProperty} simSoundProperty - whether sim sound is globally enabled
   * @param {BooleanProperty} enableToolbarProperty - whether the Toolbar is enabled
   */
  constructor( audioOptions, simSoundProperty, enableToolbarProperty ) {

    const panelChildren = [];

    // The self-voicing feature is not supported with i18n at this time, it should only be enabled and configurable
    // if running in english locale
    // NOTE: This should be for the whole feature, not just the dialog
    if ( phet.chipper.locale === 'en' && audioOptions.supportsSelfVoicing ) {
      panelChildren.push( new SelfVoicingPanelSection( enableToolbarProperty ) );
    }

    if ( audioOptions.supportsSound ) {
      panelChildren.push( new SoundPanelSection( audioOptions ) );
    }

    const sections = new HBox( {
      align: 'top',
      children: panelChildren
    } );

    const allAudioLabel = new Text( allAudioString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const allAudioCheckbox = new Checkbox( allAudioLabel, simSoundProperty );

    simSoundProperty.link( ( enabled, previousValue ) => { sections.enabled = enabled; } );

    super( {
      align: 'center',
      spacing: 25,
      children: [ allAudioCheckbox, sections ]
    } );
  }
}

joist.register( 'AudioPreferencesTabPanel', AudioPreferencesTabPanel );
export default AudioPreferencesTabPanel;