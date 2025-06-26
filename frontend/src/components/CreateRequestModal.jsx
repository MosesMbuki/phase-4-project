import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';

const CreateRequestModal = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    onCreate(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Create New Request"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="speakerName"
          label="Speaker Name"
          rules={[{ required: true, message: 'Please input the speaker name!' }]}
        >
          <Input placeholder="Enter speaker name" />
        </Form.Item>

        <Form.Item
          name="manufacturer"
          label="Manufacturer"
        >
          <Input placeholder="Enter manufacturer (optional)" />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: 'Please input the reason!' }]}
        >
          <Input.TextArea rows={4} placeholder="Explain why you need this speaker" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRequestModal;