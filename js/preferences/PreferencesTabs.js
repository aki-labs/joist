// Copyright 2021-2022, University of Colorado Boulder

/**
 * The tabs for the PreferencesDialog. Activating a tab will select a PreferencesTabPanel to be displayed to the user.
 * The actual tabs are implemented as radio buttons, styled to look like flat like a set of tabs.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { FocusHighlightPath } from '../../../scenery/js/imports.js';
import { KeyboardUtils } from '../../../scenery/js/imports.js';
import { Voicing } from '../../../scenery/js/imports.js';
import { PressListener } from '../../../scenery/js/imports.js';
import { Line } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Rectangle } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

// constants
const generalTitleString = joistStrings.preferences.tabs.general.title;
const visualTitleString = joistStrings.preferences.tabs.visual.title;
const audioTitleString = joistStrings.preferences.tabs.audio.title;
const inputTitleString = 'Input';
const preferencesTabResponsePatternString = joistStrings.a11y.preferences.tabs.tabResponsePattern;

class PreferencesTabs extends Node {

  /**
   * @param {PreferencesTab[]} supportedTabs - list of tabs the Dialog should include
   * @param {EnumerationDeprecatedProperty.<PreferencesDialog.PreferenceTab>} selectedPanelProperty
   */
  constructor( supportedTabs, selectedPanelProperty ) {
    super( {

      tagName: 'ul',
      ariaRole: 'tablist',
      groupFocusHighlight: true
    } );

    // @private {null|Node} - A reference to the selected and focusable tab content so that we can determine which
    // tab is next in order when cycling through with alternative input.
    this.selectedButton = null;

    // @private {EnumerationDeprecatedProperty}
    this.selectedPanelProperty = selectedPanelProperty;

    // @private {Tab[]}
    this.content = [];
    const addTabIfSupported = ( preferenceTab, titleString ) => {
      _.includes( supportedTabs, preferenceTab ) && this.content.push( new Tab( titleString, selectedPanelProperty, preferenceTab ) );
    };
    addTabIfSupported( PreferencesDialog.PreferencesTab.GENERAL, generalTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.VISUAL, visualTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.AUDIO, audioTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.INPUT, inputTitleString );

    for ( let i = 0; i < this.content.length; i++ ) {
      this.addChild( this.content[ i ] );
      if ( this.content[ i - 1 ] ) {
        this.content[ i ].leftCenter = this.content[ i - 1 ].rightCenter.plusXY( 10, 0 );
      }
    }

    // pdom - keyboard support to move through tabs with arrow keys
    const keyboardListener = {
      keydown: event => {

        // reserve keyboard events for dragging to prevent default panning behavior with zoom features
        event.pointer.reserveForKeyboardDrag();
      },
      keyup: event => {
        if ( ( KeyboardUtils.isAnyKeyEvent( event.domEvent, [ KeyboardUtils.KEY_RIGHT_ARROW, KeyboardUtils.KEY_LEFT_ARROW ] ) ) ) {

          // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in full screen mode
          event.domEvent.preventDefault();

          const direction = KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_RIGHT_ARROW ) ? 1 : -1;
          for ( let i = 0; i < this.content.length; i++ ) {
            if ( this.selectedButton === this.content[ i ] ) {
              const nextButtonContent = this.content[ i + direction ];
              if ( nextButtonContent ) {

                // select the next tab and move focus to it - a listener on selectedPanelProperty sets the next
                // selectedButton and makes it focusable
                selectedPanelProperty.value = nextButtonContent.value;
                this.selectedButton.focus();

                break;
              }
            }
          }
        }
      }
    };
    this.addInputListener( keyboardListener );

    const selectedPanelListener = selectedPanel => {
      this.content.forEach( content => {
        if ( content.value === this.selectedPanelProperty.value ) {
          this.selectedButton = content;
        }
      } );
    };
    selectedPanelProperty.link( selectedPanelListener );

    // if there is only one tab, it is not interactive
    if ( supportedTabs.length === 1 ) {
      this.focusable = false;
      this.inputEnabledProperty.value = false;
    }

    // @private
    this.disposePreferencesTabs = () => {
      this.removeListener( keyboardListener );
      selectedPanelProperty.unlink( selectedPanelListener );
    };
  }

  /**
   * Move focus to the selected tab. Useful when the Preferences dialog is opened.
   * @public
   */
  focusSelectedTab() {
    this.content.forEach( content => {
      if ( content.value === this.selectedPanelProperty.value ) {
        content.focus();
      }
    } );
  }

  /**
   * @public
   */
  dispose() {
    this.disposePreferencesTabs();
    super.dispose();
  }
}

/**
 * Inner class, a single tab for the list of tabs.
 * @mixes Voicing
 */
class Tab extends Voicing( Node, 0 ) {

  /**
   * @param {string} label - text label for the tab
   * @param {EnumerationDeprecatedProperty.<PreferencesDialog.<PreferencesTab>} property
   * @param {PreferencesDialog.PreferencesTab} value - PreferencesTab shown when this tab is selected
   */
  constructor( label, property, value ) {

    const textNode = new Text( label, PreferencesDialog.TAB_OPTIONS );

    // background Node behind the Text for layout spacing, and to increase the clickable area of the tab
    const backgroundNode = new Rectangle( textNode.bounds.dilatedXY( 15, 10 ), {
      children: [ textNode ]
    } );

    const underlineNode = new Line( 0, 0, textNode.width, 0, {
      stroke: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5,
      centerTop: textNode.centerBottom.plusXY( 0, 5 )
    } );

    super( {
      children: [ backgroundNode, underlineNode ],
      cursor: 'pointer',

      // pdom
      tagName: 'button',
      innerContent: label,
      ariaRole: 'tab',
      focusable: true,
      containerTagName: 'li'
    } );

    // @public {PreferenceTab}
    this.value = value;

    this.voicingNameResponse = StringUtils.fillIn( preferencesTabResponsePatternString, {
      title: label
    } );

    const buttonListener = new PressListener( {
      press: () => {
        property.set( value );

        // speak the object response on activation
        this.voicingSpeakNameResponse();
      },

      // phet-io - opting out for now to get CT working
      tandem: Tandem.OPT_OUT
    } );
    this.addInputListener( buttonListener );

    Property.multilink( [ property, buttonListener.isOverProperty ], ( selectedTab, isOver ) => {
      textNode.opacity = selectedTab === value ? 1 :
                         isOver ? 0.8 :
                         0.6;

      this.focusable = selectedTab === value;
      underlineNode.visible = selectedTab === value;
    } );

  }
}

joist.register( 'PreferencesTabs', PreferencesTabs );
export default PreferencesTabs;