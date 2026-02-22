import { useNavigate } from 'react-router-dom';
import notFoundImage from '../../assets/images/404.svg';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes blobPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }

        .nf-wrapper {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f9fc;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          padding: 16px;
        }

        /* Ambient blobs */
        .nf-blob-top {
          position: absolute;
          top: -120px;
          right: -100px;
          width: clamp(200px, 40vw, 420px);
          height: clamp(200px, 40vw, 420px);
          border-radius: 50%;
          background: radial-gradient(circle, #c8dff7 0%, transparent 70%);
          animation: blobPulse 6s ease-in-out infinite;
          pointer-events: none;
        }

        .nf-blob-bottom {
          position: absolute;
          bottom: -140px;
          left: -80px;
          width: clamp(180px, 35vw, 380px);
          height: clamp(180px, 35vw, 380px);
          border-radius: 50%;
          background: radial-gradient(circle, #d4ede8 0%, transparent 70%);
          animation: blobPulse 8s ease-in-out infinite reverse;
          pointer-events: none;
        }

        /* Card */
        .nf-card {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 480px;
          padding: clamp(24px, 5vw, 56px) clamp(16px, 4vw, 48px);
          animation: floatUp 0.5s ease both;
        }

        /* Image */
        .nf-image {
          width: 100%;
          max-width: clamp(160px, 45vw, 280px);
          height: auto;
          display: block;
          margin: 0 auto clamp(20px, 4vh, 32px);
          animation: floatUp 0.5s ease 0.1s both;
          opacity: 0;
        }

        /* Heading */
        .nf-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(1.4rem, 4vw, 2rem);
          color: #1a2e44;
          margin-bottom: clamp(8px, 2vh, 14px);
          animation: floatUp 0.5s ease 0.2s both;
          opacity: 0;
        }

        /* Subtext */
        .nf-sub {
          font-size: clamp(0.85rem, 2.2vw, 1rem);
          color: #6b7f96;
          line-height: 1.65;
          margin-bottom: clamp(24px, 4vh, 36px);
          animation: floatUp 0.5s ease 0.3s both;
          opacity: 0;
          max-width: 380px;
        }

        /* Actions */
        .nf-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          animation: floatUp 0.5s ease 0.4s both;
          opacity: 0;
        }

        /* Buttons */
        .nf-btn-primary,
        .nf-btn-secondary {
          border-radius: 10px;
          padding: clamp(10px, 2vh, 13px) clamp(20px, 4vw, 32px);
          font-size: clamp(0.85rem, 2vw, 0.95rem);
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nf-btn-primary {
          background: #1e4064;
          color: #fff;
          border: none;
          box-shadow: 0 4px 14px rgba(30, 64, 100, 0.2);
        }

        .nf-btn-primary:hover {
          background: #1a3a5c;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(30, 64, 100, 0.35);
        }

        .nf-btn-secondary {
          background: #fff;
          color: #1e4064;
          border: 1.5px solid #d0dce8;
        }

        .nf-btn-secondary:hover {
          background: #f0f4f8;
          transform: translateY(-2px);
        }

        /* Very small screens — stack buttons full width */
        @media (max-width: 360px) {
          .nf-actions {
            flex-direction: column;
            width: 100%;
          }
          .nf-btn-primary,
          .nf-btn-secondary {
            width: 100%;
          }
        }
      `}</style>

      <div className="nf-wrapper">
        <div className="nf-blob-top" />
        <div className="nf-blob-bottom" />

        <div className="nf-card">
          <img
            src={notFoundImage}
            alt="404 Not Found"
            className="nf-image"
          />

          <h1 className="nf-heading">Lost in the neighborhood?</h1>
          <p className="nf-sub">
            The page you're looking for has moved, been demolished, or never existed.
            Let's get you back on the map.
          </p>

          <div className="nf-actions">
            <button className="nf-btn-primary" onClick={() => navigate('/')}>
              Go Home
            </button>
            <button className="nf-btn-secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}