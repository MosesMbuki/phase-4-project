import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Divider, Spin, Tag, Rate, List, Avatar, Form, Input } from 'antd';
import { UserContext } from '../context/UserContext';
import moment from 'moment';
import toast from 'react-hot-toast';

const { TextArea } = Input;

const SpeakerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth, currentUser } = useContext(UserContext);
  const [speaker, setSpeaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchSpeakerData = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`/speakers/${id}`);
        setSpeaker(data);
      } catch (error) {
        toast.error('We couldn\'t load the speaker details. Please try again later.');
        navigate('/speakers');
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakerData();
  }, [id, navigate, fetchWithAuth]);

  const handleReviewSubmit = async () => {
    if (!currentUser) {
      toast.error('Please sign in to submit a review');
      return;
    }
    if (!rating || !reviewText) {
      toast.error('Please provide both a rating and your review comments');
      return;
    }
  
    try {
      setReviewLoading(true);
      const response = await fetchWithAuth('/reviews/create_review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speaker_id: id,
          rating: rating,
          comment: reviewText
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
  
      toast.success('Thank you for your review!');
      
      // Refresh speaker data
      const speakerData = await fetchWithAuth(`/speakers/${id}`);
      setSpeaker(speakerData);
      setReviewText('');
      setRating(0);
    } catch (error) {
      toast.error(error.message || 'We couldn\'t submit your review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
  }

  if (!speaker) {
    return <div>Speaker not found</div>;
  }

  return (
    <div className="speaker-detail" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <img 
            src={speaker.image_url || 'https://via.placeholder.com/600'} 
            alt={speaker.model_name}
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </Col>
        <Col xs={24} md={12}>
          <h1>{speaker.model_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Rate disabled value={speaker.avg_rating} allowHalf style={{ marginRight: '8px' }} />
            <span>({speaker.reviews.length} reviews)</span>
          </div>
          <h3>by {speaker.manufacturer.name}</h3>
          <Divider />
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF4B2B' }}>
            ${speaker.price?.toFixed(2) || 'Price not available'}
          </p>
          
          <div style={{ margin: '24px 0' }}>
            <h3>About This Speaker</h3>
            <p style={{ margin: '16px 0' }}>{speaker.specs.description}</p>
            
            <h4>Key Features:</h4>
            <ul>
              {speaker.specs.features?.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>

      <Divider />

      <div style={{ margin: '40px 0' }}>
        <h2>Customer Reviews</h2>
        
        {currentUser && (
          <div style={{ marginBottom: '40px' }}>
            <h3>Write a Review</h3>
            <Rate value={rating} onChange={setRating} />
            <Form.Item>
              <TextArea 
                rows={4} 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)} 
                placeholder="Share your thoughts about this speaker..."
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                onClick={handleReviewSubmit}
                loading={reviewLoading}
                disabled={!rating || !reviewText}
              >
                Submit Review
              </Button>
            </Form.Item>
          </div>
        )}

        {speaker.reviews.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={speaker.reviews}
            renderItem={review => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={review.user_avatar} alt={review.username} />}
                  title={<>
                    <a>{review.username}</a>
                    <Rate 
                      disabled 
                      defaultValue={review.rating} 
                      style={{ fontSize: 14, marginLeft: 8 }} 
                    />
                  </>}
                  description={<>
                    <p>{moment(review.date).format('MMMM Do YYYY')}</p>
                    <p>{review.comment}</p>
                  </>}
                />
              </List.Item>
            )}
          />
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </div>

      <Divider />

      <h2>Related Products</h2>
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {speaker.related_speakers.map(related => (
          <Col key={related.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <img 
                  alt={related.model_name} 
                  src={related.image_url || 'https://via.placeholder.com/300'} 
                  style={{ height: '180px', objectFit: 'cover' }}
                />
              }
              onClick={() => navigate(`/speakers/${related.id}`)}
            >
              <Card.Meta
                title={related.model_name}
                description={
                  <>
                    <p style={{ fontWeight: 'bold', color: '#FF4B2B' }}>
                      ${related.price?.toFixed(2) || 'Price not available'}
                    </p>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SpeakerDetailPage;