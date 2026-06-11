import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** 旧URL互換: 結果画面は廃止しホームへリダイレクト */
export function BeginnerResultPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}
