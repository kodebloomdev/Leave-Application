export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-gray-700 py-3 mt-6 text-center border-t">
      <p className="text-sm">
        © {new Date().getFullYear()} School Principal Portal · All Rights Reserved
      </p>
      <p className="text-xs text-gray-500">
        Powered by MERN + IAM (ForgeRock) + ML Security
      </p>
    </footer>
  );
}
