// Copyright 2013-2021, University of Colorado Boulder

/**
 * Decorative frame around the selected node
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import merge from '../../phet-core/js/merge.js';
import { Node } from '../../scenery/js/imports.js';
import { Rectangle } from '../../scenery/js/imports.js';
import { LinearGradient } from '../../scenery/js/imports.js';
import joist from './joist.js';

class Frame extends Node {

  /**
   * @param {Node} content
   * @param {Object} [options]
   */
  constructor( content, options ) {

    // default options
    options = merge( {
      xMargin1: 6,
      yMargin1: 6,
      cornerRadius: 0 // radius of the rounded corners on the background
    }, options );

    super();

    const frameWidth = content.width + 2 * options.xMargin1;
    const frameHeight = content.height + 2 * options.yMargin1;

    // @private
    this.gradient = new LinearGradient( 0, 0, frameWidth, 0 )
      .addColorStop( 0, '#fbff41' )
      .addColorStop( 118 / 800.0, '#fef98b' )
      .addColorStop( 372 / 800.0, '#feff40' )
      .addColorStop( 616 / 800, '#fffccd' )
      .addColorStop( 1, '#fbff41' );

    // @private
    const rectangle = new Rectangle( 0, 0, frameWidth, frameHeight, options.cornerRadius, options.cornerRadius, {
      stroke: this.gradient,
      lineWidth: 3,
      x: content.x - options.xMargin1,
      y: content.y - options.yMargin1
    } );
    this.addChild( rectangle );

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );

    // @private - highlight rectangle is always in the scene graph to make sure the node is positioned properly
    // but only visible when highlighted
    const frameBounds = Bounds2.rect( rectangle.x, rectangle.y, frameWidth, frameHeight );
    this.highlightRectangle = Rectangle.bounds( frameBounds.dilated( 0.75 ), {
      stroke: 'transparent',
      lineWidth: 4.5
    } );
    this.addChild( this.highlightRectangle );
  }

  // @public
  setHighlighted( highlighted ) {
    this.highlightRectangle.stroke = highlighted ? this.gradient : 'transparent';
  }
}

joist.register( 'Frame', Frame );
export default Frame;