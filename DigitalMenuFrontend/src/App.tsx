// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './admin/auth/AuthProvider';
import { ProtectedRoute } from './admin/auth/ProtectedRoute';
import { LoginPage } from './admin/pages/LoginPage';
import DigitalMenu from './DigitalMenu';
import { SettingsPage } from './admin/pages/SettingsPage';
import { CategoriesPage } from './admin/pages/CategoriesPage';
import { ItemsPage } from './admin/pages/ItemPage';
import { AdminLayout } from './admin/pages/AdminLayout';
import Home from './Home';


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<SettingsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="items" element={<ItemsPage />} />
            </Route>
          </Route>

          <Route path='/:RestaurantId' element={<DigitalMenu />} />
          <Route path='/' element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}