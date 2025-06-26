import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const AboutPage = () => {
  return (
    <div className="about-page" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto',
      padding: '24px',
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px'
    }}>
      {/* Main Content Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        '@media (min-width: 768px)': {
          gridTemplateColumns: '1fr 1fr'
        }
      }}>
        {/* About Section */}
        <Card>
          <Title level={1} style={{ marginBottom: '8px' }}>About Audio Alchemy</Title>
          <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: '24px' }}>
            Your trusted source for high-quality audio equipment
          </Paragraph>
          <Paragraph style={{ marginBottom: '16px' }}>
            Founded in 2023, Audio Alchemy began as a passion project between audiophiles who believed 
            everyone deserves access to high-quality sound equipment without the pretentiousness of 
            traditional audio retailers.
          </Paragraph>
          <Paragraph style={{ marginBottom: '16px' }}>
            We've grown from a small blog reviewing speakers to becoming 
            the trusted destination for honest audio equipment recommendations.
          </Paragraph>
          <Paragraph style={{ marginBottom: '16px' }}>
            We exist to demystify audio technology and help you find the perfect speakers for your needs 
            and budget.
          </Paragraph>
          <Paragraph>
            Whether you're a casual listener or a professional sound engineer, we provide unbiased, 
            expert reviews of speakers and audio equipment.
          </Paragraph>
        </Card>

        {/* Image Section */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Audio Equipment"
            style={{ 
              width: '100%',
              maxHeight: '500px',
              objectFit: 'cover',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      </div>

      {/* Contact Section */}
      <Card style={{ marginTop: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>Contact Us</Title>
        <form style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
          '@media (min-width: 768px)': {
            gridTemplateColumns: '1fr 1fr'
          }
        }}>
          <input
            type="text"
            placeholder="First name"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
              width: '100%'
            }}
          />
          <input
            type="text"
            placeholder="Last name"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
              width: '100%'
            }}
          />
          <input
            type="email"
            placeholder="Email address"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
              width: '100%',
              gridColumn: '1 / -1'
            }}
          />
          <textarea
            placeholder="Enter your question or message"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
              width: '100%',
              minHeight: '120px',
              gridColumn: '1 / -1'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              background: 'linear-gradient(to right, #FF4B2B, #FF416C)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              gridColumn: '1 / -1'
            }}
          >
            Submit
          </button>
        </form>
      </Card>
    </div>
  );
};

export default AboutPage;