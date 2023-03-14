import React, { useCallback, useState } from 'react';
import { Col, Radio, Row, RadioChangeEvent } from 'antd';
import classNames from 'classnames';
import { DingtalkOutlined, WechatOutlined } from '@ant-design/icons';
import * as styles from './Communities.module.less';

interface CommunitiesProps {
  showDingTalkQRCode: boolean;
  showWeChatQRCode: boolean;
  weChatQRCode: string;
  dingTalkQRCode: string;
  className?: string;
  style?: React.CSSProperties;
}

export enum CommunityType {
  WeChat = 'wechat',
  Dingtalk = 'dingtalk',
}

const Communities: React.FC<CommunitiesProps> = ({
  weChatQRCode,
  dingTalkQRCode,
  className,
  style,
}) => {
  const [type, setType] = useState<string>(CommunityType.Dingtalk);

  const handleTypeChange = useCallback(
    (e: RadioChangeEvent) => {
      setType(e.target.value);
    },
    [type],
  );

  return (
    <div className={classNames(styles.wrapper, className)} style={style}>
      <Row justify="center">
        <Radio.Group
          onChange={handleTypeChange}
          value={type}
          style={{ marginBottom: 8 }}
        >
          <Radio.Button value={CommunityType.Dingtalk}>
            <DingtalkOutlined /> DingTalk
          </Radio.Button>
          <Radio.Button value={CommunityType.WeChat}>
            <WechatOutlined /> WeChat
          </Radio.Button>
        </Radio.Group>
      </Row>
      <Row justify="center" style={{ marginTop: 20 }}>
        <img
          src={type === CommunityType.Dingtalk ? dingTalkQRCode : weChatQRCode}
          alt=""
        />
      </Row>
      <Row justify="center" style={{ marginTop: 20 }}>
        <p className={styles.text}>
          长按保存图片到本地后，使用
          {type === CommunityType.Dingtalk ? '钉钉' : '微信'} “扫一扫”
        </p>
      </Row>
    </div>
  );
};
export default Communities;
