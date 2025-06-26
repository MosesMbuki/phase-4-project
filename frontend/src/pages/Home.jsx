import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';  

const Home = () => {
  const navigate = useNavigate();
  const { fetchWithAuth } = useContext(UserContext);
  const [featuredSpeakers, setFeaturedSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedSpeakers = async () => {
      try {
        const data = await fetchWithAuth('/speakers?limit=3');
        setFeaturedSpeakers(data);
      } catch (error) {
        console.error('Error fetching speakers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedSpeakers();
  }, [fetchWithAuth]);;

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 z-0 object-cover opacity-70"
        >
          <source src="https://cdn.create.vista.com/api/media/medium/222444716/stock-video-glitter-exploding-into-a-rainbow-of-colors-speaker-part-music-loop-background?token=" />
        </video>
        
        {/* Content */}
        <div className="relative z-10 text-center px-5 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-wider mb-4">
            AUDIO ALCHEMY
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 leading-relaxed text-gray-300">
            Transforming sound into pure emotion through precision engineering
          </p>
          <button
            onClick={() => navigate('/speakers')}
            className="bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] px-12 py-3 uppercase tracking-wider text-sm md:text-base transition-all duration-300 hover:opacity-90">
            EXPLORE COLLECTIONS
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-5 bg-gray-900">
        <h2 className="text-center text-3xl md:text-4xl font-bold uppercase tracking-wider mb-16 relative">
          CRAFTED FOR PERFECTION
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-114 h-0.5 bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] mt-8"></span>
        </h2>
        
        {loading ? (
          <div className="text-center">Loading featured speakers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredSpeakers.map((speaker) => (
              <div 
                key={speaker.id} 
                className="relative h-96 overflow-hidden rounded-lg group cursor-pointer"
                onClick={() => navigate(`/speakers/${speaker.id}`)}
              >
                <img 
                  src={speaker.image_url} 
                  alt={speaker.model_name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-2xl font-medium mb-1">{speaker.model_name}</h3>
                  <p className="mb-4 text-gray-300">${speaker.price?.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">{speaker.manufacturer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brand Story */}
      <section className="py-32 px-5 bg-black text-center border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-12">
            THE ALCHEMY OF SOUND
          </h2>
          <p className="text-2xl md:text-3xl italic leading-relaxed mb-8 text-gray-300">
            "We don't manufacture speakers - we forge instruments that reveal the hidden dimensions of music."
          </p>
          <p className="uppercase tracking-widest text-sm text-gray-400">
            — Master Audio Alchemist
          </p>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-24 px-5 bg-gray-900">
        <h2 className="text-center text-3xl md:text-4xl font-bold uppercase tracking-wider mb-16 relative">
          OUR ALCHEMICAL SECRETS
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-[#FF4B2B] to-[#FF416C] mt-8"></span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { icon: '🧪', title: 'PURE MATERIALS', desc: 'Only the finest acoustic materials' },
            { icon: '⚡', title: 'POWER TRANSFORMATION', desc: 'Efficient energy conversion' },
            { icon: '🎚️', title: 'PRECISION TUNING', desc: 'Hand-tuned by our masters' },
            { icon: '🌌', title: 'SOUNDSTAGE', desc: 'Holographic imaging' },
          ].map((tech, index) => (
            <div 
              key={index} 
              className="bg-gray-800 p-8 rounded-lg text-center transition-all duration-300 hover:bg-gray-700 hover:shadow-lg"
            >
              <div className="text-5xl mb-6">{tech.icon}</div>
              <h3 className="text-xl font-bold uppercase tracking-wider mb-4">{tech.title}</h3>
              <p className="text-gray-400">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;