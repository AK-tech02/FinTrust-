import './AnimatedBackground.css';

const AnimatedBackground = () => {
  return (
    <div className="animated-background">
      {/* Layer 1: Gentle Gradient */}
      <div className="gradient-layer"></div>
      
      {/* Layer 2: Floating Circles */}
      <div className="floating-circles">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      
      {/* Layer 3: Soft Light Rays */}
      <div className="light-rays">
        <div className="ray"></div>
        <div className="ray"></div>
        <div className="ray"></div>
        <div className="ray"></div>
        <div className="ray"></div>
      </div>
      
      {/* Layer 4: Pulsing Glow Orbs */}
      <div className="glow-orbs">
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
      </div>
    </div>
  );
};

export default AnimatedBackground;
