import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { registerSchema } from "../../validators/register.schema.js";
import Notification from "../../components/Notification.jsx";
import gsap from "gsap";
import logo from "../../assets/logo.svg";
import beginArtwork from "../../assets/beginartwork.svg";
import { useAnimation } from "../../contexts/AnimationContext";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [formStatus, setFormStatus] = useState(null);
  const { setAnimationExiting } = useAnimation();

  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const wrapperRef = useRef(null);
  const formRef = useRef(null);
  const linksRef = useRef(null);

  // Enter animation
  useEffect(() => {
    console.log("RegisterPage: GSAP loaded:", gsap);
    const wrapper = wrapperRef.current;
    const form = formRef.current;
    const links = linksRef.current;

    if (wrapper && form && links) {
      console.log("RegisterPage: Running enter animation");
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024; // sm to lg
      const wrapperY = isMobile ? -20 : isTablet ? -50 : -80; // Adjusted for screen size
      const formX = isMobile ? -20 : isTablet ? -50 : -100; // Adjusted for screen size

      gsap.set([wrapper, form, links], { willChange: "transform, opacity" });
      gsap.set(wrapper, { y: wrapperY, opacity: 0 });
      gsap.set(form, { x: formX, opacity: 0 });
      gsap.set(links, { opacity: 0, y: isMobile ? 10 : 20 });

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "auto";
        },
      });
      tl.to(wrapper, {
        y: 0,
        opacity: 1,
        duration: isMobile ? 0.6 : 0.8,
        ease: "power3.out",
      })
        .to(
          form,
          {
            x: 0,
            opacity: 1,
            duration: isMobile ? 0.6 : 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        )
        .to(
          links,
          {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.4 : 0.6,
            ease: "power3.out",
          },
          "-=0.2"
        );
    } else {
      console.error("RegisterPage: wrapperRef, formRef, or linksRef is not available");
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Hàm xử lý điều hướng với hiệu ứng exit
  const handleNavigate = async (path) => {
    if (isLoading || isExiting) return;
    setIsExiting(true);
    setAnimationExiting(true);

    await new Promise((resolve) => {
      if (wrapperRef.current && formRef.current && linksRef.current) {
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
        const formX = isMobile ? -20 : isTablet ? -50 : -100;
        document.body.style.overflow = "hidden";
        const tl = gsap.timeline({
          onComplete: () => {
            console.log("RegisterPage: Navigation exit animation completed");
            document.body.style.overflow = "auto";
            resolve();
          },
        });
        tl.to(wrapperRef.current, {
          opacity: 0,
          duration: isMobile ? 0.6 : 1,
          ease: "power3.in",
        })
          .to(
            formRef.current,
            {
              x: formX,
              opacity: 0,
              duration: isMobile ? 0.6 : 1,
              ease: "power3.in",
            },
            0
          )
          .to(
            linksRef.current,
            {
              opacity: 0,
              y: isMobile ? 10 : 20,
              duration: isMobile ? 0.4 : 0.6,
              ease: "power3.in",
            },
            0
          );
      } else {
        console.error("RegisterPage: Exit animation skipped: refs not available");
        resolve();
      }
    });

    setAnimationExiting(false);
    navigate(path, { replace: true });
  };

  const onSubmit = async (data) => {
    if (isLoading || isExiting) return;
    setIsLoading(true);
    setFormStatus(null);
    setIsExiting(true);
    setAnimationExiting(true); // Cập nhật context

    try {
      const result = await registerUser(data);

      if (result.success && result.status === 201) {
        setFormStatus({
          status: "success",
          message: result.message || "Registration successful. Please verify your email.",
        });

        console.log("RegisterPage: Starting exit animation");
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 5000)), // Wait for notification
          new Promise((resolve) => {
            if (wrapperRef.current && formRef.current && linksRef.current) {
              const isMobile = window.innerWidth < 640;
              const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
              const formX = isMobile ? -20 : isTablet ? -50 : -100;
              document.body.style.overflow = "hidden";
              const tl = gsap.timeline({
                onComplete: () => {
                  console.log("RegisterPage: Exit animation completed");
                  document.body.style.overflow = "auto";
                  resolve();
                },
              });
              tl.to(wrapperRef.current, {
                opacity: 0,
                duration: isMobile ? 0.6 : 1,
                ease: "power3.in",
              })
                .to(
                  formRef.current,
                  {
                    x: formX,
                    opacity: 0,
                    duration: isMobile ? 0.6 : 1,
                    ease: "power3.in",
                  },
                  0
                )
                .to(
                  linksRef.current,
                  {
                    opacity: 0,
                    y: isMobile ? 10 : 20,
                    duration: isMobile ? 0.4 : 0.6,
                    ease: "power3.in",
                  },
                  0
                );
            } else {
              console.error("RegisterPage: Exit animation skipped: refs not available");
              resolve();
            }
          }),
        ]);

        console.log("RegisterPage: Navigating to /login");
        setAnimationExiting(false); // Reset trạng thái context
        navigate("/login", { replace: true });
      } else {
        setFormStatus({
          status: "error",
          message: result.message || "Registration failed.",
        });
        setIsLoading(false);
        setIsExiting(false);
        setAnimationExiting(false); // Reset trạng thái context
      }
    } catch (error) {
      console.error("RegisterPage: Registration error", error);
      setFormStatus({
        status: "error",
        message: "An unexpected error occurred.",
      });
      setIsLoading(false);
      setIsExiting(false);
      setAnimationExiting(false); // Reset trạng thái context
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ height: "100vh" }}
    >
      <div
        ref={wrapperRef}
        className="w-full max-w-[1280px] mx-auto flex flex-col md:flex-row-reverse rounded-2xl bg-transparent border-0 lg:bg-[#111111] lg:border lg:border-primary/20"
      >
        <div className="hidden md:flex md:w-[60%] w-full items-center justify-center p-4 sm:p-6 lg:p-8">
          <img
            src={beginArtwork}
            alt="Register artwork"
            className="w-full h-full max-h-[70vh] object-contain"
            loading="eager"
          />
        </div>
        <div
          ref={formRef}
          className="w-full md:w-[40%] p-4 sm:p-6 lg:p-8 flex items-center justify-center"
        >
          <div
            className="w-full max-w-[400px] bg-base-100 rounded-xl border-2 border-primary p-4 sm:p-6 lg:p-8
                       shadow-[0_12px_24px_#E5D49E,0_6px_12px_#E5D49E] transition-all duration-500
                       hover:shadow-[0_16px_32px_#E5D49E,0_8px_16px_#E5D49E] hover:-translate-y-1
                       hover:[transform:perspective(1000px)_rotateX(-2deg)_rotateY(-2deg)]"
          >
            <img
              src={logo}
              alt="Reux Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-4 drop-shadow-lg"
            />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-texas text-center mb-4 sm:mb-6 text-primary tracking-widest drop-shadow">
              CREATE ACCOUNT
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs sm:text-sm lg:text-base font-texas tracking-wide text-base-content mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  placeholder="Enter your username"
                  className="input w-full font-kurohe bg-base-200 border-2 border-primary/60 rounded-md text-sm sm:text-base
                             shadow-[inset_0_4px_8px_rgba(62,7,3,0.3),inset_0_2px_4px_rgba(62,7,3,0.2)]
                             focus:shadow-[inset_0_2px_4px_rgba(62,7,3,0.2)] focus:border-primary focus:ring-2 focus:ring-primary/50
                             transition-all duration-300 placeholder:text-base-content/60 py-2 sm:py-2.5"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs sm:text-sm mt-1.5 text-error">{errors.username.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm lg:text-base font-texas tracking-wide text-base-content mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="input w-full font-kurohe bg-base-200 border-2 border-primary/60 rounded-md text-sm sm:text-base
                             shadow-[inset_0_4px_8px_rgba(62,7,3,0.3),inset_0_2px_4px_rgba(62,7,3,0.2)]
                             focus:shadow-[inset_0_2px_4px_rgba(62,7,3,0.2)] focus:border-primary focus:ring-2 focus:ring-primary/50
                             transition-all duration-300 placeholder:text-base-content/60 py-2 sm:py-2.5"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs sm:text-sm mt-1.5 text-error">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs sm:text-sm lg:text-base font-texas tracking-wide text-base-content mb-1.5"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  placeholder="Enter your first name"
                  className="input w-full font-kurohe bg-base-200 border-2 border-primary/60 rounded-md text-sm sm:text-base
                             shadow-[inset_0_4px_8px_rgba(62,7,3,0.3),inset_0_2px_4px_rgba(62,7,3,0.2)]
                             focus:shadow-[inset_0_2px_4px_rgba(62,7,3,0.2)] focus:border-primary focus:ring-2 focus:ring-primary/50
                             transition-all duration-300 placeholder:text-base-content/60 py-2 sm:py-2.5"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs sm:text-sm mt-1.5 text-error">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs sm:text-sm lg:text-base font-texas tracking-wide text-base-content mb-1.5"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  placeholder="Enter your last name"
                  className="input w-full font-kurohe bg-base-200 border-2 border-primary/60 rounded-md text-sm sm:text-base
                             shadow-[inset_0_4px_8px_rgba(62,7,3,0.3),inset_0_2px_4px_rgba(62,7,3,0.2)]
                             focus:shadow-[inset_0_2px_4px_rgba(62,7,3,0.2)] focus:border-primary focus:ring-2 focus:ring-primary/50
                             transition-all duration-300 placeholder:text-base-content/60 py-2 sm:py-2.5"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-xs sm:text-sm mt-1.5 text-error">{errors.lastName.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm lg:text-base font-texas tracking-wide text-base-content mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input w-full font-kurohe bg-base-200 border-2 border-primary/60 rounded-md pr-10 text-sm sm:text-base
                               shadow-[inset_0_4px_8px_rgba(62,7,3,0.3),inset_0_2px_4px_rgba(62,7,3,0.2)]
                               focus:shadow-[inset_0_2px_4px_rgba(62,7,3,0.2)] focus:border-primary focus:ring-2 focus:ring-primary/50
                               transition-all duration-300 placeholder:text-base-content/60 py-2 sm:py-2.5"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-content/70 hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isExiting}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size="16" className="sm:h-5 sm:w-5" /> : <Eye size="16" className="sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs sm:text-sm mt-1.5 text-error">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs sm:text-sm lg:text-base font-texas tracking-wide text-base-content mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="input w-full font-kurohe bg-base-200 border-2 border-primary/60 rounded-md pr-10 text-sm sm:text-base
                               shadow-[inset_0_4px_8px_rgba(62,7,3,0.3),inset_0_2px_4px_rgba(62,7,3,0.2)]
                               focus:shadow-[inset_0_2px_4px_rgba(62,7,3,0.2)] focus:border-primary focus:ring-2 focus:ring-primary/50
                               transition-all duration-300 placeholder:text-base-content/60 py-2 sm:py-2.5"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-content/70 hover:text-primary transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || isExiting}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size="16" className="sm:h-5 sm:w-5" /> : <Eye size="16" className="sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs sm:text-sm mt-1.5 text-error">{errors.confirmPassword.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || isExiting}
                className="btn w-full font-texas text-sm sm:text-base lg:text-lg tracking-wider uppercase
                           bg-primary text-primary-content border-2 border-primary rounded-lg py-2 sm:py-2.5
                           shadow-[0_6px_12px_rgba(62,7,3,0.5),0_4px_8px_rgba(62,7,3,0.3)]
                           hover:shadow-[0_8px_16px_rgba(62,7,3,0.6),0_6px_12px_rgba(62,7,3,0.4)]
                           hover:-translate-y-1 active:translate-y-0.5 active:shadow-[0_2px_4px_rgba(62,7,3,0.3)]
                           transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                           focus:text-base-content focus:bg-base-100"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                      <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" fill="currentColor" />
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
              <div
                ref={linksRef}
                className="flex flex-col items-center space-y-2 text-xs sm:text-sm lg:text-base font-texas tracking-wide text-primary"
              >
                <button
                  type="button"
                  onClick={() => handleNavigate("/login")}
                  className="cursor-pointer hover:underline hover:text-primary/80 transition-colors"
                  disabled={isLoading || isExiting}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Notification
        status={formStatus?.status}
        message={formStatus?.message}
        onClose={() => setFormStatus(null)}
      />
    </div>
  );
}