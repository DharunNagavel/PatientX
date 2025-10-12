import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Copyright } from "lucide-react";
import HealthMinistry from "../assets/healthministry.png";
import WHO from "../assets/who.png";

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-10 pb-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-500">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link to="/" className="hover:text-blue-500">
                Home
              </Link>
            </li>
            <li>
              <Link to="/records" className="hover:text-blue-500">
                Records
              </Link>
            </li>
            <li>
              <Link to="/research" className="hover:text-blue-500">
                Research
              </Link>
            </li>
            <li>
              <Link to="/consent" className="hover:text-blue-500">
                Consent
              </Link>
            </li>
            <li>
              <Link to="/wallet" className="hover:text-blue-500">
                Wallet
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-500">
            Useful Links
          </h3>
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            <a
              href="https://main.mohfw.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={HealthMinistry}
                alt="Ministry of Health & Family Welfare"
                className="h-24 w-36 bg-white p-2 rounded-lg hover:opacity-80 transition"
              />
            </a>
            <a
              href="https://www.who.int/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={WHO}
                alt="World Health Organization"
                className="h-24 w-36 bg-white p-2 rounded-lg hover:opacity-80 transition"
              />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-500">
            Get in Touch
          </h3>
          <p className="text-gray-300 text-sm">
            Email:{" "}
            <a
              href="mailto:patientx.platform@gmail.com"
              className="hover:text-blue-500"
            >
              patientx.platform@gmail.com
            </a>
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="/" target="_blank" rel="noreferrer" className="hover:text-blue-500">
              <Facebook size={20} />
            </a>
            <a href="/" target="_blank" rel="noreferrer" className="hover:text-blue-500">
              <Instagram size={20} />
            </a>
            <a href="/" target="_blank" rel="noreferrer" className="hover:text-blue-500">
              <Twitter size={20} />
            </a>
            <a href="mailto:patientx.platform@gmail.com" rel="noreferrer" className="hover:text-blue-500">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
      <p className="text-center mt-6 text-gray-400 text-sm flex items-center justify-center gap-2">
        <Copyright size={14} /> Last Updated on 10 October 2025 | ©{" "}
        {new Date().getFullYear()} PatientX
      </p>
    </footer>
  );
};

export default Footer;
