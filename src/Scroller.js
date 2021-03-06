import React from "react";
import PiTape from "./Tape";

class PiScroller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollValue: 0,
      mouseAngle: 0,
      mouseDown: false,
      buttonClick: false,
      prevAngle: 0,
      tickerOffset: 0,
      canvasLastX: 0,
      codeAdditions: []
    };
  }

  static defaultProps = {
    radius: 64,
    yOffset: 100,
    xOffset: 100,
    lineWidth: 40,
    canvasWidth: 200,
    canvasHeight: 200,
    scrollToShift: 20,
    shiftWidth: 20
  };

  componentDidMount() {
    const clickerCanvas = this.refs.clickerCanvas;
    const context = clickerCanvas.getContext("2d");
    const rect = this.refs.clickerCanvas.getBoundingClientRect();

    this.setState({ canvasLastX: rect.left });

    context.beginPath();
    context.lineWidth = this.props.lineWidth;
    context.strokeStyle = "rgb(192,192,192)";
    context.arc(
      this.props.xOffset,
      this.props.yOffset,
      this.props.radius,
      0,
      2 * Math.PI
    );
    context.stroke();

    context.beginPath();
    context.lineWidth = this.props.lineWidth;
    context.strokeStyle = "rgb(145,145,145)";
    context.arc(
      this.props.xOffset,
      this.props.yOffset,
      this.props.radius,
      0,
      2 * Math.PI
    );
    context.stroke();

    window.addEventListener("mouseup", this.mouseUpHandler.bind(this));
    window.addEventListener("mousemove", this.canvasMoveHandler.bind(this));
  }

  calculateRelativeValues(e) {
    const rect = this.refs.clickerCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - this.props.xOffset;
    const dy = y - this.props.yOffset;
    const dist = Math.abs(Math.sqrt(dx * dx + dy * dy));
    this.setState({ canvasLastX: rect.left });
    return { x: x, y: y, dx: dx, dy: dy, dist: dist };
  }

  canvasClickHandler(e) {
    const dist = this.calculateRelativeValues(e).dist;

    if (dist <= this.props.radius + this.props.lineWidth / 2) {
      if (dist >= this.props.radius - this.props.lineWidth / 2) {
        this.setState({ mouseDown: true, prevAngle: this.getAngle(e) });
      } else {
        this.setState({ buttonClick: true });
      }
    }
  }

  getAngle(e) {
    const vals = this.calculateRelativeValues(e);
    return ((Math.atan2(vals.dy, vals.dx) + Math.PI) * 180) / Math.PI;
  }

  updateOnMouse(e) {
    const newAngle = this.getAngle(e);
    const prevAngle = this.state.prevAngle;

    this.setState({ mouseAngle: this.getAngle(e), prevAngle: newAngle });
    if (Math.abs(newAngle - prevAngle) > 2) return;
    const newScrollValue = this.state.scrollValue - (prevAngle - newAngle);
    this.setState({ scrollValue: newScrollValue });
    // scrollValue was updated! Calculate if we move the thing
    if (Math.abs(this.state.scrollValue) >= this.props.scrollToShift) {
      // now we actually shift the ticker tape
      var sign = 1;
      if (this.state.scrollValue < 0) {
        sign = -1;
      }
      this.state.tickerOffset += sign;
      this.state.scrollValue =
        this.state.scrollValue % this.props.scrollToShift;
    }
    if (this.state.tickerOffset < 0) {
      this.setState({ tickerOffset: 0 });

      if (this.state.scrollValue < 0) this.setState({ scrollValue: 0 });
    }
  }

  mouseUpHandler(e) {
    if (this.state.mouseDown) {
      this.setState({ mouseDown: false });
      this.updateOnMouse(e);
    }
    if (this.state.buttonClick) {
      this.setState({ buttonClick: false });
        /*
      this.setState(prevState => ({
        codeAdditions: [
          ...prevState.codeAdditions,
          this.refs.piTape.state.currentTriplet
        ]
      }));
      */
      this.props.inputReadyHandler(this.refs.piTape.state.currentTriplet);
    }
  }

  canvasMoveHandler(e) {
    if (this.state.mouseDown) {
      this.updateOnMouse(e);
    }
  }

  render() {
    const style = {
      position: "absolute",
      bottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: -100,
      left: "50%"
    };
    const backgroundDivStyle = {
      position: "absolute",
      bottom: 50,
      left: "50%",
      width: 100,
      height: 100,
      backgroundColor: "white",
      marginLeft: -50
    };
    if (this.state.buttonClick)
      backgroundDivStyle.backgroundColor = "rgb(224,224,224)";

    return (
      <div>
        <div style={backgroundDivStyle}></div>
        <PiTape
          ref="piTape"
          position={this.state.tickerOffset}
          yOffset={this.props.yOffset}
          xOffset={this.props.xOffset}
          canvasX={this.state.canvasLastX}
        />
        <canvas
          style={style}
          ref="clickerCanvas"
          onMouseDown={this.canvasClickHandler.bind(this)}
          width={this.props.canvasWidth}
          height={this.props.canvasHeight}
        />
      </div>
    );
  }
}

export default PiScroller;
