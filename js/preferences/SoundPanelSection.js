// Copyright 2021, University of Colorado Boulder

/**
 * Section of the "Audio" panel of the PreferencesDialog related to sound.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Text from '../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import soundManager from '../../../tambo/js/soundManager.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';

// constants
const soundLabelString = joistStrings.preferences.tabs.audio.soundAndSonification;
const enhancedSoundLabelString = joistStrings.preferences.tabs.audio.enhancedSound;

class SoundPanelSection extends PreferencesPanelSection {

  /**
   * @param {Object} audioOptions - configuration for audio preferences, see PreferencesConfiguration
   */
  constructor( audioOptions ) {

    const soundLabel = new Text( soundLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const titleNode = new Checkbox( soundLabel, soundManager.enabledProperty );

    let enhancedSoundCheckbox = null;
    if ( audioOptions.supportsEnhancedSound ) {
      const enahncedSoundLabel = new Text( enhancedSoundLabelString, { font: PreferencesDialog.CONTENT_FONT } );
      enhancedSoundCheckbox = new Checkbox( enahncedSoundLabel, soundManager.enhancedSoundEnabledProperty );
      soundManager.enabledProperty.link( enabled => {
        enhancedSoundCheckbox.enabled = enabled;
      } );
    }

    super( {
      titleNode: titleNode,
      contentNode: enhancedSoundCheckbox
    } );
  }
}

joist.register( 'SoundPanelSection', SoundPanelSection );
export default SoundPanelSection;