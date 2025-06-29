import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Input, Spin, Rate, Button, Modal, Form, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { UserContext } from '../context/UserContext';
import toast from 'react-hot-toast';

const { Search } = Input;
const { TextArea } = Input;

const Speakers = () => {
  const { fetchWithAuth, currentUser } = useContext(UserContext);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredSpeakers, setFilteredSpeakers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth('/speakers');
        setSpeakers(data);
        setFilteredSpeakers(data);
      } catch (error) {
        toast.error('We couldn\'t load the speaker list. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, [fetchWithAuth]);

  const handleSearch = (value) => {
    if (!value) {
      setFilteredSpeakers(speakers);
      return;
    }
    const filtered = speakers.filter(speaker =>
      speaker.model_name.toLowerCase().includes(value.toLowerCase()) ||
      speaker.manufacturer.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSpeakers(filtered);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const navigateToSpeaker = (id) => {
    navigate(`/speakers/${id}`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
  
      // Prepare features array from comma-separated string
      const featuresArray = values.specs?.features 
        ? values.specs.features.split(',').map(f => f.trim()).filter(f => f)
        : [];
  
      // Structure data exactly as backend expects
      const requestData = {
        model_name: values.model_name,
        price: values.price,
        manufacturer_name: values.manufacturer_name, // Using name instead of ID
        manufacturer_logo_url: values.manufacturer_logo_url,
        category_name: values.category_name, // Using name instead of ID
        image_url: values.image_url || 'https://via.placeholder.com/300',
        specs: {
          description: values.specs?.description || '',
          features: featuresArray,
          dimensions: values.specs?.dimensions || '',
          weight: values.specs?.weight || ''
        }
      };
  
      const response = await fetchWithAuth('/speakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
  
      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server rejected the request');
      }
  
      const result = await response.json();
      toast.success(result.message || 'Speaker added successfully!');
      
      // Refresh data
      const updatedSpeakers = await fetchWithAuth('/speakers');
      setSpeakers(updatedSpeakers);
      setFilteredSpeakers(updatedSpeakers);
      setIsModalOpen(false);
      form.resetFields();
  
    } catch (error) {
      console.error('Add speaker error:', error);
      toast.error(error.message || 'Failed to add speaker. Please check your details.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="speakers-page" style={{ padding: '24px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Our Speaker Collection</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Search
          placeholder="Search speakers..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: '600px' }}
        />
        {currentUser?.is_admin && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showModal}
            style={{ background: 'linear-gradient(to right, #FF4B2B, #FF416C)', border: 'none' }}
          >
            Add Speaker
          </Button>
        )}
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredSpeakers.map(speaker => (
            <Col key={speaker.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <img 
                    alt={speaker.model_name} 
                    src={speaker.image_url || 'https://via.placeholder.com/300'} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                }
                onClick={() => navigateToSpeaker(speaker.id)}
              >
                <Card.Meta
                  title={speaker.model_name}
                  description={
                    <>
                      <p>{speaker.manufacturer}</p>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Rate disabled value={speaker.avg_rating} allowHalf style={{ fontSize: '14px', marginRight: '8px' }} />
                        <span>({Math.round(speaker.avg_rating * 10) / 10})</span>
                      </div>
                      <p style={{ fontWeight: 'bold', color: '#FF4B2B', marginTop: '8px' }}>
                        ${speaker.price?.toFixed(2) || 'Price not available'}
                      </p>
                      <p style={{ marginTop: '8px' }}>{speaker.short_description}...</p>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Add New Speaker"
        open={isModalOpen} 
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
        destroyOnHidden={false} 
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            specs: {
              description: '',
              features: [],
              dimensions: '',
              weight: ''
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="model_name"
                label="Model Name"
                rules={[{ required: true, message: 'Please enter model name' }]}
              >
                <Input placeholder="Enter model name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  placeholder="Enter price" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manufacturer_name"
                label="Manufacturer Name"
                rules={[{ required: true, message: 'Please enter manufacturer name' }]}
              >
                <Input placeholder="Enter manufacturer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="manufacturer_logo_url"
                label="Manufacturer Logo URL"
              >
                <Input placeholder="Enter logo URL" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_name"
                label="Category Name"
                rules={[{ required: true, message: 'Please enter category name' }]}
              >
                <Input placeholder="Enter category name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="image_url"
                label="Speaker Image URL"
              >
                <Input placeholder="Enter image URL" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={['specs', 'description']}
            label="Description"
          >
            <TextArea rows={4} placeholder="Enter speaker description" />
          </Form.Item>

          <Form.Item
            name={['specs', 'features']}
            label="Features (comma separated)"
          >
            <Input placeholder="Enter features separated by commas" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['specs', 'dimensions']}
                label="Dimensions"
              >
                <Input placeholder="Enter dimensions" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['specs', 'weight']}
                label="Weight"
              >
                <Input placeholder="Enter weight" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Speakers;