export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#050403",
        color: "#d0c8b8",
        fontFamily: "'Georgia', serif",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <p
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          letterSpacing: "5px",
          textTransform: "uppercase",
          color: "#ca903d",
          marginBottom: "24px",
        }}
      >
        Coming Soon
      </p>
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: 300,
          color: "#d4a94e",
          letterSpacing: "8px",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        Back to the Basics
      </h1>
      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: 400,
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "#8a7e6e",
          marginBottom: "40px",
        }}
      >
        Guarded &middot; Grounded &middot; Grateful
      </p>
      <p style={{ fontSize: "1.2rem", color: "#d0c8b8", maxWidth: "500px", lineHeight: 1.9 }}>
        Restoring clarity in a distracted world.
      </p>
      <div
        style={{
          width: "60px",
          height: "1px",
          background: "#ca903d",
          margin: "40px auto",
        }}
      />
      <p style={{ fontSize: "0.9rem", color: "#5a5245" }}>
        &copy; 2026 Back to the Basics Movement LLC
      </p>
    </main>
  );
}
