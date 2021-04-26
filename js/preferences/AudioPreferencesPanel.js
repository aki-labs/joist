// Copyright 2021, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing controls related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import voicingManager from '../../../scenery/js/accessibility/speaker/voicingManager.js';
import webSpeaker from '../../../scenery/js/accessibility/speaker/webSpeaker.js';
import VoicingText from '../../../scenery-phet/js/accessibility/speaker/VoicingText.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';

// constants
const allAudioString = joistStrings.preferences.tabs.audio.allAudio.title;
const allAudioDescriptionString = joistStrings.preferences.tabs.audio.allAudio.description;
const allAudioEnabledAlert = joistStrings.a11y.allAudio.enabledAlert;
const allAudioDisabledAlert = joistStrings.a11y.allAudio.disabledAlert;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

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
      descriptionNode: new VoicingText( allAudioDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        voicingText: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: allAudioString,
          description: allAudioDescriptionString
        } )
      } ),
      a11yLabel: allAudioString
    } );

    const soundEnabledListener = ( enabled, previousValue ) => {
      sections.enabled = enabled;

      // alerts should occur lazily, not on construction
      if ( previousValue !== null ) {
        const alertString = enabled ? allAudioEnabledAlert : allAudioDisabledAlert;

        phet.joist.sim.utteranceQueue.addToBack( alertString );

        if ( webSpeaker.enabled && voicingManager.mainWindowVoicingEnabledProperty.value ) {
          webSpeaker.speakImmediately( alertString );
        }
      }
    };

    simSoundProperty.link( soundEnabledListener );

    super( {
      align: 'center',
      spacing: 25,
      children: [ allAudioSwitch, sections ],

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: 'Audio'
    } );

    // @private - for disposal
    this.disposeAudioPreferencesPanel = () => {
      simSoundProperty.unlink( soundEnabledListener );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeAudioPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'AudioPreferencesTabPanel', AudioPreferencesTabPanel );
export default AudioPreferencesTabPanel;