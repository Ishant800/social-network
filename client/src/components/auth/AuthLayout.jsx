import logo from '../../assets/logo.png';

export default function AuthLayout({ heading, subheading, children }) {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 bg-gray-50 border-r border-gray-200">
        <div className="text-center max-w-md">
          <img src={logo} alt="Logo" className="h-50 w-auto mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{heading}</h1>
          <p className="text-gray-600 text-sm">{subheading}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
