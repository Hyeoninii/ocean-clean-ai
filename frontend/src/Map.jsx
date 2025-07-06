import { useEffect, useRef } from 'react';

const KAKAO_MAP_KEY = '597380dfdf26e73807b7ccad8a564c4d';

function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        createMap();
      } else {
        // 스크립트가 아직 없으면 삽입
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
        //dapi.kakao.com/v2/maps/sdk.js?appkey=00000000
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(() => {
            createMap();
          });
        };
        document.head.appendChild(script);
      }
    };

    const createMap = () => {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.8),
        level: 13,
      };
      new window.kakao.maps.Map(container, options);
    };

    loadKakaoMap();
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginTop: '24px',
        background: '#eee',
      }}
    />
  );
}

export default Map;