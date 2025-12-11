import React from 'react';
import { Row, Col, Card, Tabs } from 'antd';
import SendNotificationForm from '../components/notifications/SendNotificationForm';

const { TabPane } = Tabs;

const NotificationManagement = () => {
  return (
    <Card title="Quản lý thông báo">
      <Tabs defaultActiveKey="send">
        <TabPane tab="Gửi thông báo" key="send">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <SendNotificationForm />
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Hướng dẫn">
                <p>Để gửi thông báo đến người dùng, vui lòng nhập đầy đủ các trường thông tin:</p>
                <ul>
                  <li>Tiêu đề: Tên thông báo ngắn gọn</li>
                  <li>Nội dung: Chi tiết thông báo</li>
                  <li>Đối tượng: Chọn gửi cho tất cả hoặc một số người dùng cụ thể</li>
                </ul>
                <p>Người dùng sẽ nhận được thông báo ngay lập tức.</p>
              </Card>
            </Col>
          </Row>
        </TabPane>
        {/* Có thể bổ sung thêm các tab khác như Lịch sử thông báo, v.v. */}
      </Tabs>
    </Card>
  );
};

export default NotificationManagement;