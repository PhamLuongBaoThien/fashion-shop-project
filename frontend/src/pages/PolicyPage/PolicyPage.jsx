import { Alert, Card, Skeleton, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as PolicyService from "../../services/PolicyService";
import "./PolicyPage.css";

const { Title, Text } = Typography;

const PolicyPage = () => {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["published-policy", slug],
    queryFn: () => PolicyService.getPublishedPolicyBySlug(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="policy-page">
        <Card><Skeleton active /></Card>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="policy-page">
        <Alert
          type="info"
          showIcon
          message="Chính sách chưa được xuất bản"
          description="Vui lòng quay lại sau hoặc liên hệ cửa hàng để được hỗ trợ."
        />
      </div>
    );
  }

  const policy = data.data;

  return (
    <main className="policy-page">
      <Card className="policy-card">
        <Title level={1}>{policy.title}</Title>
        <Text type="secondary">
          Cập nhật lần cuối: {new Date(policy.updatedAt).toLocaleDateString("vi-VN")}
        </Text>
        {/* Nội dung này đã được backend sanitize trước khi lưu và trước khi trả về. */}
        <article
          className="policy-content"
          dangerouslySetInnerHTML={{ __html: policy.content }}
        />
      </Card>
    </main>
  );
};

export default PolicyPage;
