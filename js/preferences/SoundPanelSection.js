// Copyright 2021, University of Colorado Boulder

/**
 * Section of the "Audio" panel of the PreferencesDialog related to sound.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import VoicingText from '../../../scenery-phet/js/accessibility/speaker/VoicingText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import soundManager from '../../../tambo/js/soundManager.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const otherSoundsLabelString = joistStrings.preferences.tabs.audio.otherSounds;
const extraSoundsLabelString = joistStrings.preferences.tabs.audio.extraSounds;
const soundDescriptionString = 'Plays sonifications and sound effects as you interact.';
const extraSoundsDescriptionString = 'Plays an additional sound or sounds for this sim.';
const soundsOnString = 'Sounds on.';
const soundsOffString = 'Sounds Off.';
const extraSoundsOnString = 'Extra Sounds On.';
const extraSoundsOffString = 'Extra Sounds Off.';
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

class SoundPanelSection extends PreferencesPanelSection {

  /**
   * @param {Object} audioOptions - configuration for audio preferences, see PreferencesConfiguration
   */
  constructor( audioOptions ) {

    const soundLabel = new Text( otherSoundsLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const titleNode = new PreferencesToggleSwitch( soundManager.enabledProperty, false, true, {
      labelNode: soundLabel,
      descriptionNode: new VoicingText( soundDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        voicingText: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: otherSoundsLabelString,
          description: soundDescriptionString
        } )
      } ),
      a11yLabel: otherSoundsLabelString
    } );

    let enhancedSoundContent = null;
    if ( audioOptions.supportsEnhancedSound ) {
      const enahncedSoundLabel = new Text( extraSoundsLabelString, { font: PreferencesDialog.CONTENT_FONT } );
      const enhancedSoundCheckbox = new Checkbox( enahncedSoundLabel, soundManager.enhancedSoundEnabledProperty, {

        // pdom
        labelTagName: 'label',
        labelContent: extraSoundsLabelString,

        // voicing
        voicingCreateObjectResponse: event => {
          if ( event.type === 'focus' ) {
            return extraSoundsLabelString;
          }
        }
      } );
      soundManager.enabledProperty.link( enabled => {
        enhancedSoundCheckbox.enabled = enabled;
      } );
      const enhancedSoundDescription = new VoicingText( extraSoundsDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        voicingText: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: extraSoundsLabelString,
          description: extraSoundsDescriptionString
        } )
      } );

      enhancedSoundContent = new Node( {
        children: [ enhancedSoundCheckbox, enhancedSoundDescription ]
      } );

      enhancedSoundDescription.leftTop = enhancedSoundCheckbox.leftBottom.plusXY( 0, 5 );
    }

    super( {
      titleNode: titleNode,
      contentNode: enhancedSoundContent
    } );

    // voicing
    soundManager.enabledProperty.lazyLink( enabled => {
      const alert = enabled ? soundsOnString : soundsOffString;
      phet.joist.sim.voicingUtteranceQueue.addToBack( alert );
    } );

    soundManager.enhancedSoundEnabledProperty.lazyLink( enabled => {
      const alert = enabled ? extraSoundsOnString : extraSoundsOffString;
      phet.joist.sim.voicingUtteranceQueue.addToBack( alert );
    } );
  }
}

joist.register( 'SoundPanelSection', SoundPanelSection );
export default SoundPanelSection;