import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div
      style={{
        backgroundImage: "url('/your-image-path/bg.jpg')",
        backgroundSize: "cover",
        minHeight: "100vh",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Navbar />
      <div className="pt-5 mt-4 container">{children}</div>
    </div>
  );
};

export default Layout;
