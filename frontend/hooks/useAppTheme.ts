import { useEffect } from 'react';
import { AppTheme } from '../config/appConfig';

export function useAppTheme(appTheme: AppTheme): void {
  useEffect(() => {
    document.documentElement.setAttribute('data-app-theme', appTheme);
  }, [appTheme]);
}



