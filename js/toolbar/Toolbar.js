// Copyright 2021, University of Colorado Boulder

/**
 * The Toolbar along the left edge of the screen with controls related to the sim or active screen. Currently, it
 * only contains controls related to the self-voicing feature. It isn't always displayed and the user must request it
 * from the PreferencesDialog. In order to be used, both self-voicing AND the Toolbar must be requested by the user,
 * self-voicing can be used without this component.
 *
 * When open, the sim will resize and shift to the right to create space. Screen bounds are adjusted so that
 * simulation components will never overlap with the Toolbar.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Shape from '../../../kite/js/Shape.js';
import webSpeaker from '../../../scenery/js/accessibility/speaker/webSpeaker.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import ButtonNode from '../../../sun/js/buttons/ButtonNode.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import joist from '../joist.js';
import VoicingToolbarItem from './VoicingToolbarItem.js';

// constants
const MAX_ANIMATION_SPEED = 5; // in view coordinates, maximum speed at which Toolbar will open/close
const CONTENT_TOP_MARGIN = 15; // margin between top of Toolbar and contents

class Toolbar extends Node {

  /**
   * @param {VoicingToolbarAlertManager} selfVoicingAlertManager - generates self-voicing alerts
   * @param {BooleanProperty} enabledProperty - whether or not the Toolbar is enabled and visible to the user
   * @param {LookAndFeel} lookAndFeel
   */
  constructor( selfVoicingAlertManager, enabledProperty, lookAndFeel ) {
    super();

    // @private {BooleanProperty} - Whether or not the Toolbar is enabled (visible to the user)
    this.isEnabledProperty = enabledProperty;

    // @private {Rectangle} - the Rectangle for the Toolbar that surrounds all content, bounds set once
    // content is created and in layout to fill height of screen
    this.backgroundRectangle = new Rectangle( 0, 0, 0, 0, {
      fill: lookAndFeel.navigationBarFillProperty
    } );

    // @public {NumberProperty} - The position of the right edge of the backgroundRectangle in local coordinates.
    // This is what controls the position of the Toolbar as it is open/closed/removed/animating.
    this.rightPositionProperty = new NumberProperty( 0 );

    // @private {number} - The target position for the rightPositionProperty, to support animation. In step,
    // the rightPositionProperty will be changed until the rightPositionProperty equals the rightDestinationPosition.
    this.rightDestinationPosition = 0;

    // @private {BooleanProperty} - Whether or not the Toolbar is open or closed. This is different from
    // whether or not it is showing.
    this.openProperty = new BooleanProperty( true );

    // @public (read-only) {DerivedProperty.<boolean>} - Whether the Toolbar is shown to the user. At this time,
    // that is true if self-voicing and the Toolbar are explicitly enabled. Note that isShowingProperty can be true
    // while openProperty is false, they are unrelated.
    this.isShowingProperty = DerivedProperty.and( [ this.isEnabledProperty, webSpeaker.enabledProperty ] );

    // @private {number} - Scale applied to the Toolbar and its contents in response to layout and window resizing.
    this.layoutScale = 1;

    // @private {VoicingToolbarItem} - Contents for the Toolbar, currently only controls related to the self-voicing
    // feature.
    this.menuContent = new VoicingToolbarItem( selfVoicingAlertManager, lookAndFeel );

    // icon for the openButton
    const chevronIcon = new DoubleChevron();

    // @private {RoundPushButton}
    this.openButton = new RoundPushButton( {
      content: chevronIcon,
      listener: () => this.openProperty.toggle(),
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      baseColor: 'lightgrey'
    } );

    // @private {number} - width of content for the toolbar in the local coordinates frame
    this.contentWidth = this.menuContent.localBounds.width;

    // @private {number} - Margin between toolbar content and edge of the backgroundRectangle, in the local coordinate
    // frame. Also used to determine the right position when closed. This is the width of the button so that when the
    // Toolbar is closed only the button is shown and all other content is hidden.
    this.contentMargin = this.openButton.localBounds.width;

    this.children = [ this.backgroundRectangle, this.menuContent, this.openButton ];

    // move to destination position in the animation frame
    stepTimer.addListener( dt => {
      this.step( dt );
    } );

    this.openProperty.link( ( open, oldValue ) => {

      // rotate chevron to indicate direction of toolbar movement
      chevronIcon.matrix = open ? Matrix3.scaling( -1, 1 ) : Matrix3.IDENTITY;

      // when closed, menu content should be hidden from screen readers and the navigation order
      this.menuContent.pdomVisible = open;

      this.updateDestinationPosition();
    } );

    // when shown or hidden update destination positions so it animates open or close
    this.isShowingProperty.link( showing => this.updateDestinationPosition() );
  }

  /**
   * Returns the width of the Toolbar that can be seen on screen. This can be any value from the full width of the
   * Toolbar to zero width, depending on whether it is open, closed, removed entirely, or animating.
   * @public
   *
   * @returns {number}
   */
  getDisplayedWidth() {
    return this.rightPositionProperty.value * this.layoutScale + this.openButton.width / 2;
  }

  /**
   * Update rightDestinationPosition so that the Toolbar will animate towards opening, closing, or being removed
   * entirely from view.
   * @private
   */
  updateDestinationPosition() {
    if ( this.isShowingProperty.value ) {

      // the Toolbar is enabled and should either show all content or just the openButton
      this.rightDestinationPosition = this.openProperty.value ? this.contentWidth + this.contentMargin * 2 : this.contentMargin;
    }
    else {

      // no aspect of the menu should be visible
      this.rightDestinationPosition = -this.contentMargin / 2;
    }
  }

  /**
   * Animated the Toolbar as it opens and closes.
   * @private
   *
   * @param {number} dt
   */
  step( dt ) {
    const distance = Math.abs( this.rightPositionProperty.value - this.rightDestinationPosition );

    if ( distance !== 0 ) {
      const animationDistance = Math.min( distance, MAX_ANIMATION_SPEED );
      const currentPosition = this.rightPositionProperty.value;

      this.rightPositionProperty.value = this.rightDestinationPosition > currentPosition ?
                                         currentPosition + animationDistance :
                                         currentPosition - animationDistance;
    }
  }

  /**
   * Layout for the Toolbar, called whenever position changes or window is resized.
   * @public
   *
   * @param {number} scale
   * @param {number} height
   */
  layout( scale, height ) {
    this.layoutScale = scale;

    this.menuContent.setScaleMagnitude( scale );
    this.openButton.setScaleMagnitude( scale );

    this.backgroundRectangle.rectWidth = scale * ( this.contentWidth + this.contentMargin * 2 );
    this.backgroundRectangle.rectHeight = height;
    this.backgroundRectangle.right = this.rightPositionProperty.value * scale;

    this.openButton.center = this.backgroundRectangle.rightCenter;
    this.menuContent.centerTop = this.backgroundRectangle.centerTop.plusXY( 0, CONTENT_TOP_MARGIN );
  }
}

/**
 * The icon for the openButton on the Toolbar.
 */
class DoubleChevron extends Path {
  constructor() {

    // spacing and dimensions for the arrows
    const chevronSpacing = 8;
    const chevronWidth = 5;
    const chevronHeight = 12;

    const chevronShape = new Shape();
    for ( let i = 0; i < 2; i++ ) {
      const left = i * chevronSpacing;
      chevronShape.moveTo( left, 0 );
      chevronShape.lineTo( left + chevronWidth, chevronHeight / 2 );
      chevronShape.lineTo( left, chevronHeight );
    }

    super( chevronShape, {
      stroke: 'black',
      lineWidth: 3.5,
      lineCap: 'round'
    } );
  }
}

joist.register( 'Toolbar', Toolbar );
export default Toolbar;
