import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { Table, Button, message, Space, Tag, Card, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import CreateRequestModal from '../components/CreateRequestModal';

const Request = () => {

  const { currentUser, fetchWithAuth } = useContext(UserContext);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);

 
const fetchRequests = async () => {
  try {
    setLoading(true);
    // For admin: fetch all requests
    // For regular user: fetch only their requests
    const endpoint = currentUser?.is_admin ? '/requests' : '/requests/user';
    const data = await fetchWithAuth(endpoint);
    setRequests(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  // Create request function
  const createRequest = async (speakerName, manufacturer, reason) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/requests/create_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speaker_name: speakerName,
          manufacturer: manufacturer,
          reason: reason
        })
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create request');
      }
  
      return result;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update request status function
  const updateRequestStatus = async (requestId, status) => {
    try {
      setLoading(true);
      await fetchWithAuth(`/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      await fetchRequests();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // delete request function
  const deleteUserRequest = async (requestId) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/requests/user/${requestId}`, {
        method: 'DELETE'
      });
      
      if (response.message) {
        message.success(response.message);
        await fetchRequests(); // Refresh the list
      }
    } catch (error) {
      message.error(error.error || 'Failed to delete request');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (requestId) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this request?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteUserRequest(requestId),
    });
  };

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (currentUser && requests) {
      if (currentUser.is_admin) {
        setFilteredRequests(requests);
      } else {
        setFilteredRequests(requests.filter(req => req.user_id === currentUser.id));
      }
    }
  }, [requests, currentUser]);

  const columns = [
    {
      title: 'Speaker',
      dataIndex: 'speaker_name',
      key: 'speaker_name',
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'approved' ? 'green' : 
          status === 'rejected' ? 'red' : 'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'request_date',
      key: 'request_date',
      render: date => new Date(date).toLocaleDateString(),
    },
    // {
    //   title: 'Actions',
    //   key: 'actions',
    //   render: (_, record) => (
    //     <Space size="middle">
    //       {/* Show delete button only if current user is the owner */}
    //       {currentUser && record.user_id === currentUser.id && (
    //         <Button 
    //           danger
    //           onClick={() => handleDelete(record.id)}
    //           disabled={loading}
    //         >
    //           Delete
    //         </Button>
    //       )}
    //     </Space>
    //   ),
    // },
    ...(currentUser?.is_admin ? [
      {
        title: 'User',
        dataIndex: 'user_id',
        key: 'user_id',
        render: id => `User ${id}`,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space size="middle">
            <Button 
              type="primary" 
              onClick={() => handleStatusUpdate(record.id, 'approved')}
              disabled={record.status === 'approved'}
            >
              Approve
            </Button>
            <Button 
              danger
              onClick={() => handleStatusUpdate(record.id, 'rejected')}
              disabled={record.status === 'rejected'}
            >
              Reject
            </Button>
          </Space>
        ),
      }
    ] : []),
  ];

  const handleCreateRequest = async (values) => {
    try {
      await createRequest(values.speakerName, values.manufacturer, values.reason);
      message.success('Request created successfully!');
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to create request');
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      message.success(`Request ${status} successfully!`);
    } catch (error) {
      message.error(`Failed to ${status} request`);
    }
  };

  return (
    <div className="request-page">
      <Card
        title={`${currentUser?.is_admin ? 'All' : 'My'} Requests`}
        extra={
          !currentUser?.is_admin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              New Request
            </Button>
          )
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
          />
        </Spin>
      </Card>

      <CreateRequestModal
        visible={isModalVisible}
        onCreate={handleCreateRequest}
        onCancel={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default Request;