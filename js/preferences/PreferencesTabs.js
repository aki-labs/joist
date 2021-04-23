// Copyright 2021, University of Colorado Boulder

/**
 * The tabs for the PreferencesDialog. Activating a tab will select a PreferencesTabPanel to be displayed to the user.
 * The actual tabs are implemented as radio buttons, styled to look like flat like a set of tabs.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import FocusHighlightPath from '../../../scenery/js/accessibility/FocusHighlightPath.js';
import KeyboardUtils from '../../../scenery/js/accessibility/KeyboardUtils.js';
import PressListener from '../../../scenery/js/listeners/PressListener.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import joist from '../joist.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Line from '../../../scenery/js/nodes/Line.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

// constants
const generalTitleString = joistStrings.preferences.tabs.general.title;
const visualTitleString = joistStrings.preferences.tabs.visual.title;
const audioTitleString = joistStrings.preferences.tabs.audio.title;
const inputTitleString = joistStrings.preferences.tabs.input.title;

class PreferencesTabs extends Node {

  /**
   * @param {PreferencesConfiguration} preferencesConfiguration
   * @param {PreferencesTab[]} supportedTabs - list of tabs the Dialog should include
   * @param {EnumerationProperty.<PreferencesDialog.PreferenceTab>} selectedPanelProperty
   */
  constructor( preferencesConfiguration, supportedTabs, selectedPanelProperty ) {
    super( {

      tagName: 'ul',
      ariaRole: 'tablist',
      groupFocusHighlight: true
    } );

    // @private {null|Node} - A reference to the selected and focusable tab content so that we can determine which
    // tab is next in order when cycling through with alternative input.
    this.selectedButton = null;

    // @private {EnumerationProperty}
    this.selectedPanelProperty = selectedPanelProperty;

    //@private {{node: Node, value: PreferenceTab}[]}
    this.content = [];
    const addTabIfSupported = ( preferenceTab, titleString ) => {
      _.includes( supportedTabs, preferenceTab ) && this.content.push( this.createButtonContent( titleString, selectedPanelProperty, preferenceTab ) );
    };
    addTabIfSupported( PreferencesDialog.PreferencesTab.GENERAL, generalTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.VISUAL, visualTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.AUDIO, audioTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.INPUT, inputTitleString );

    for ( let i = 0; i < this.content.length; i++ ) {
      this.addChild( this.content[ i ].node );
      if ( this.content[ i - 1 ] ) {
        this.content[ i ].node.leftCenter = this.content[ i - 1 ].node.rightCenter.plusXY( 10, 0 );
      }
    }

    // pdom - alternative input support to move through tabs with arrow keys
    this.addInputListener( {
      keyup: event => {
        if ( KeyboardUtils.isAnyKeyEvent( event.domEvent, [ KeyboardUtils.KEY_LEFT_ARROW, KeyboardUtils.KEY_RIGHT_ARROW ] ) ) {

          // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in full screen mode
          event.domEvent.preventDefault();

          const direction = ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_RIGHT_ARROW ) ) ? 1 : -1;
          for ( let i = 0; i < this.content.length; i++ ) {
            if ( this.selectedButton === this.content[ i ].node ) {
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
    } );

    // if there is only one tab, it is not interactive
    if ( supportedTabs.length === 1 ) {
      this.focusable = false;
      this.inputEnabledProperty.value = false;
    }
  }

  /**
   * Move focus to the selected tab. Useful when the Preferences dialog is opened.
   * @public
   */
  focusSelectedTab() {
    this.content.forEach( content => {
      if ( content.value === this.selectedPanelProperty.value ) {
        content.node.focus();
      }
    } );
  }

  /**
   * Creates content for one of the tabs, including a Text label and Line Node that will be displayed when a tab
   * is selected. Returns an object containing the tab content and the associated value for the Property controlling
   * the selected tab.
   * @private
   *
   * @param {string} label - for the displayed label
   * @param {EnumerationProperty.<PreferencesDialog.PreferenceTab>} property -
   * @param {PreferencesDialog.PreferenceTab} value - value for the tab
   * @returns {{node: Node, value: PreferencesDialog.PreferenceTab}}
   */
  createButtonContent( label, property, value ) {

    const textNode = new Text( label, {
      font: PreferencesDialog.TAB_FONT
    } );

    // background Node behind the Text for layout spacing, and to increase the clickable area of the tab
    const backgroundNode = new Rectangle( textNode.bounds.dilatedXY( 15, 10 ), {
      children: [ textNode ]
    } );

    const underlineNode = new Line( 0, 0, textNode.width, 0, {
      stroke: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5,
      centerTop: textNode.centerBottom.plusXY( 0, 5 )
    } );

    // all contents of the tab, with pdom
    const contentNode = new Node( {
      children: [ backgroundNode, underlineNode ],
      cursor: 'pointer',

      // pdom
      tagName: 'div',
      ariaRole: 'tab',
      focusable: true,
      containerTagName: 'li'
    } );

    const buttonListener = new PressListener( {
      press: () => {
        property.set( value );
      }
    } );
    contentNode.addInputListener( buttonListener );

    Property.multilink( [ property, buttonListener.isOverProperty ], ( selectedTab, isOver ) => {
      textNode.opacity = selectedTab === value ? 1 :
                         isOver ? 0.8 :
                         0.6;

      contentNode.focusable = selectedTab === value;
      underlineNode.visible = selectedTab === value;
      if ( contentNode.focusable ) {
        this.selectedButton = contentNode;
      }
    } );

    return {
      node: contentNode,
      value: value
    };
  }
}

joist.register( 'PreferencesTabs', PreferencesTabs );
export default PreferencesTabs;